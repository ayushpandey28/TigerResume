const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const pdfService = require('../services/resume/pdfService');
const resumeParser = require('../services/resume/resumeParser');
const documentModelService = require('../services/resume/documentModelService');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

// Upload & parse PDF resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Please upload a PDF file', 400);
    }

    // Persist original file to local disk
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const diskFileName = `${Date.now()}_${safeName}`;
    const storagePath = path.join(uploadDir, diskFileName);
    fs.writeFileSync(storagePath, req.file.buffer);

    // Extract text, physical layout pages, and metadata from PDF
    const { text: extractedText, pageCount, pages, info } = await pdfService.extractPdfDetails(req.file.buffer);

    // Build Generic Layout-Aware Document Model (zero hardcoding, preserves actual layout)
    const documentModel = documentModelService.buildDocumentModel(extractedText, {
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      pageCount: pageCount || 1,
      pages: pages || [],
      info
    });

    // Parse extracted text into structured semantic resume data for ATS / Job Matching compatibility
    const parsedData = await resumeParser.parseResume(extractedText);

    // Cloudinary upload if configured
    let fileUrl = '';
    let filePublicId = '';

    if (isCloudinaryConfigured && cloudinary) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'tiger_resumes' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        fileUrl = uploadResult.secure_url;
        filePublicId = uploadResult.public_id;
      } catch (cloudErr) {
        logger.warn('Cloudinary upload warning:', cloudErr.message);
      }
    }

    const title = (documentModel.header?.name || parsedData.contact.name)
      ? `${documentModel.header?.name || parsedData.contact.name}'s Resume`
      : req.file.originalname.replace(/\.[^/.]+$/, '');

    // Save Resume document in MongoDB with originalDocument, buffer backup, and documentModel
    const resume = await Resume.create({
      user: req.user._id,
      title,
      originalFileName: req.file.originalname,
      originalDocument: {
        storagePath,
        originalFileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        pageCount: pageCount || 1,
        fileUrl
      },
      originalFileBuffer: req.file.buffer,
      documentModel,
      fileUrl,
      filePublicId,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      contact: parsedData.contact,
      summary: parsedData.summary,
      skills: parsedData.skills,
      skillCategories: parsedData.skillCategories || [],
      education: parsedData.education,
      experience: parsedData.experience,
      projects: parsedData.projects,
      certifications: parsedData.certifications,
      currentVersion: 1
    });

    // Save initial ResumeVersion (Version 1)
    await ResumeVersion.create({
      resume: resume._id,
      user: req.user._id,
      version: 1,
      data: {
        documentModel,
        ...parsedData
      },
      changes: 'Initial upload & parsing'
    });

    return success(res, resume, 'Resume uploaded and parsed successfully', 201);
  } catch (err) {
    next(err);
  }
};

// Get all resumes for logged-in user
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('-extractedText')
      .sort({ updatedAt: -1 });

    return success(res, resumes, 'Resumes retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Get single resume by ID
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return error(res, 'Resume not found', 404);
    }
    return success(res, resume, 'Resume retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Update resume & save new version
const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return error(res, 'Resume not found', 404);
    }

    const {
      title, contact, summary, skills, skillCategories,
      education, experience, projects, certifications
    } = req.body;

    if (title) resume.title = title;
    if (contact) resume.contact = { ...resume.contact, ...contact };
    if (summary !== undefined) resume.summary = summary;
    if (skills) resume.skills = skills;
    if (skillCategories) resume.skillCategories = skillCategories;
    if (education) resume.education = education;
    if (experience) resume.experience = experience;
    if (projects) resume.projects = projects;
    if (certifications) resume.certifications = certifications;

    resume.currentVersion += 1;
    await resume.save();

    // Create new ResumeVersion
    await ResumeVersion.create({
      resume: resume._id,
      user: req.user._id,
      version: resume.currentVersion,
      data: {
        contact: resume.contact,
        summary: resume.summary,
        skills: resume.skills,
        skillCategories: resume.skillCategories,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects,
        certifications: resume.certifications
      },
      changes: `Updated to version ${resume.currentVersion}`
    });

    return success(res, resume, 'Resume updated successfully');
  } catch (err) {
    next(err);
  }
};

// Delete resume & versions
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return error(res, 'Resume not found', 404);
    }

    // Delete versions
    await ResumeVersion.deleteMany({ resume: resume._id });

    // Clean up local disk file if exists
    if (resume.originalDocument?.storagePath && fs.existsSync(resume.originalDocument.storagePath)) {
      try {
        fs.unlinkSync(resume.originalDocument.storagePath);
      } catch (fsErr) {
        logger.warn('Failed to unlink local resume file:', fsErr.message);
      }
    }

    // Cloudinary delete if exists
    if (resume.filePublicId && isCloudinaryConfigured && cloudinary) {
      try {
        await cloudinary.uploader.destroy(resume.filePublicId, { resource_type: 'raw' });
      } catch (cloudErr) {
        logger.warn('Cloudinary delete file error:', cloudErr.message);
      }
    }

    await resume.deleteOne();

    return success(res, null, 'Resume deleted successfully');
  } catch (err) {
    next(err);
  }
};

// Stream original uploaded document (PDF) for view or download
const getOriginalDocument = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
      .select('+originalFileBuffer');

    if (!resume) {
      return error(res, 'Resume not found', 404);
    }

    let fileBuffer = null;

    // 1. Try local disk storage
    if (resume.originalDocument?.storagePath && fs.existsSync(resume.originalDocument.storagePath)) {
      try {
        fileBuffer = fs.readFileSync(resume.originalDocument.storagePath);
      } catch (readErr) {
        logger.warn('Failed to read from disk storage:', readErr.message);
      }
    }

    // 2. Try database buffer backup
    if (!fileBuffer && resume.originalFileBuffer) {
      fileBuffer = resume.originalFileBuffer;
    }

    // 3. Fallback: If original buffer is not available (e.g. legacy resumes),
    // synthesize PDF on the fly from documentModel or extractedText
    if (!fileBuffer) {
      logger.info('Synthesizing PDF fallback for resume without raw buffer');
      const docModel = resume.documentModel || documentModelService.buildDocumentModel(resume.extractedText || '', {
        fileType: resume.fileType,
        fileName: resume.originalFileName
      });
      fileBuffer = await documentModelService.generateDocumentModelPdf(docModel, {
        title: resume.title
      });
    }

    const filename = resume.originalDocument?.originalFileName || resume.originalFileName || 'original_resume.pdf';
    const isDownload = req.query.download === 'true';
    const disposition = isDownload ? 'attachment' : 'inline';
    const contentType = resume.originalDocument?.fileType || resume.fileType || 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(filename)}"`);
    return res.send(fileBuffer);
  } catch (err) {
    next(err);
  }
};

// Update Document Model blocks directly
const updateDocumentModel = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return error(res, 'Resume not found', 404);
    }

    const { documentModel } = req.body;
    if (!documentModel) {
      return error(res, 'documentModel is required', 400);
    }

    resume.documentModel = documentModel;
    resume.currentVersion = (resume.currentVersion || 1) + 1;
    await resume.save();

    await ResumeVersion.create({
      resume: resume._id,
      user: req.user._id,
      version: resume.currentVersion,
      data: {
        documentModel,
        contact: resume.contact,
        summary: resume.summary,
        skills: resume.skills,
        skillCategories: resume.skillCategories,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects,
        certifications: resume.certifications
      },
      changes: `Updated document model to version ${resume.currentVersion}`
    });

    return success(res, resume, 'Document model updated successfully');
  } catch (err) {
    next(err);
  }
};

// Generate high-fidelity PDF from the edited Document Model
const generateEditedPdf = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return error(res, 'Resume not found', 404);
    }

    let docModel = resume.documentModel;
    if (!docModel || !docModel.sections || docModel.sections.length === 0) {
      docModel = documentModelService.buildDocumentModel(resume.extractedText || '', {
        fileType: resume.fileType,
        fileName: resume.originalFileName
      });
    }

    const pdfBuffer = await documentModelService.generateDocumentModelPdf(docModel, {
      title: resume.title
    });

    const candidateName = docModel.header?.name || resume.contact?.name || resume.title || 'Candidate';
    const sanitizedName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedName}_Edited_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// Get versions for a resume
const getResumeVersions = async (req, res, next) => {
  try {
    const versions = await ResumeVersion.find({
      resume: req.params.id,
      user: req.user._id
    }).sort({ version: -1 });

    return success(res, versions, 'Resume versions retrieved');
  } catch (err) {
    next(err);
  }
};

// Get specific version for a resume
const getResumeVersion = async (req, res, next) => {
  try {
    const versionDoc = await ResumeVersion.findOne({
      resume: req.params.id,
      user: req.user._id,
      version: req.params.version
    });

    if (!versionDoc) {
      return error(res, 'Resume version not found', 404);
    }

    return success(res, versionDoc, 'Version retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// AI Analysis endpoint
const analyzeResumeWithAI = async (req, res, next) => {
  try {
    const resumeAnalysis = require('../services/resume/resumeAnalysis');
    const result = await resumeAnalysis.analyzeResume(req.params.id, req.user._id);
    return success(res, result, 'Resume AI analysis completed successfully');
  } catch (err) {
    next(err);
  }
};

// AI Analysis History endpoint
const getResumeAnalysisHistory = async (req, res, next) => {
  try {
    const resumeAnalysis = require('../services/resume/resumeAnalysis');
    const history = await resumeAnalysis.getAnalysisHistory(req.params.id, req.user._id);
    return success(res, history, 'Analysis history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Generate Professional PDF
const generatePdf = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return error(res, 'Resume not found', 404);
    }

    const { template = 'classic', version, customization = {} } = req.body;
    const allowedTemplates = ['classic', 'modern', 'creative'];
    const validTemplate = allowedTemplates.includes(template) ? template : 'classic';

    let targetData = resume;

    // Version selection check
    if (version && Number(version) !== resume.currentVersion) {
      const targetVersion = await ResumeVersion.findOne({ resume: resume._id, version: Number(version) });
      if (!targetVersion) {
        return error(res, `Requested resume version ${version} not found`, 404);
      }
      targetData = {
        title: resume.title,
        contact: targetVersion.data?.contact,
        summary: targetVersion.data?.summary,
        skills: targetVersion.data?.skills,
        skillCategories: targetVersion.data?.skillCategories,
        experience: targetVersion.data?.experience,
        projects: targetVersion.data?.projects,
        education: targetVersion.data?.education,
        certifications: targetVersion.data?.certifications,
        achievements: targetVersion.data?.achievements,
        customSections: targetVersion.data?.customSections,
        documentModel: targetVersion.data?.documentModel
      };
    }

    // Auto-repair fallback: If stored resume has empty section arrays but original file exists, re-extract & re-parse
    if (
      (!targetData.experience || targetData.experience.length === 0) &&
      (!targetData.education || targetData.education.length === 0) &&
      (!targetData.projects || targetData.projects.length === 0) &&
      (!targetData.skills || targetData.skills.length === 0)
    ) {
      let bufferToParse = resume.originalFileBuffer;
      const storagePath = resume.originalDocument?.storagePath;
      if (!bufferToParse && storagePath && fs.existsSync(storagePath)) {
        try {
          bufferToParse = fs.readFileSync(storagePath);
        } catch (readErr) {
          logger.warn('Could not read original file from disk:', readErr.message);
        }
      }

      if (bufferToParse) {
        try {
          const { text: refreshedText } = await pdfService.extractPdfDetails(bufferToParse);
          if (refreshedText) {
            const reParsed = await resumeParser.parseResume(refreshedText);
            if (
              (reParsed.experience && reParsed.experience.length > 0) ||
              (reParsed.education && reParsed.education.length > 0) ||
              (reParsed.skills && reParsed.skills.length > 0)
            ) {
              targetData = {
                ...(typeof targetData.toObject === 'function' ? targetData.toObject() : targetData),
                ...reParsed
              };

              // Asynchronously update MongoDB so subsequent accesses are instantaneous
              Resume.updateOne(
                { _id: resume._id },
                {
                  $set: {
                    extractedText: refreshedText,
                    contact: reParsed.contact,
                    summary: reParsed.summary || resume.summary,
                    skills: reParsed.skills,
                    skillCategories: reParsed.skillCategories || [],
                    education: reParsed.education,
                    experience: reParsed.experience,
                    projects: reParsed.projects,
                    certifications: reParsed.certifications,
                    achievements: reParsed.achievements || []
                  }
                }
              ).catch(err => logger.warn('Background resume repair update failed:', err.message));
            }
          }
        } catch (reErr) {
          logger.warn('Auto-repair parsing failed:', reErr.message);
        }
      }
    }

    const pdfBuffer = await pdfService.generatePdfBuffer({
      resume: targetData,
      templateId: validTemplate,
      customization
    });

    const candidateName = targetData.contact?.name || resume.title || 'Candidate';
    const sanitizedName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedName}_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  getResumeVersions,
  getResumeVersion,
  analyzeResumeWithAI,
  getResumeAnalysisHistory,
  generatePdf,
  getOriginalDocument,
  updateDocumentModel,
  generateEditedPdf
};



