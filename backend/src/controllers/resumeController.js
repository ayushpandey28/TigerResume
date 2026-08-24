const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const pdfService = require('../services/resume/pdfService');
const resumeParser = require('../services/resume/resumeParser');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

// Upload & parse PDF resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Please upload a PDF file', 400);
    }

    // Extract text from PDF
    const extractedText = await pdfService.extractText(req.file.buffer);

    // Parse extracted text into structured resume data
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

    const title = parsedData.contact.name
      ? `${parsedData.contact.name}'s Resume`
      : req.file.originalname.replace(/\.[^/.]+$/, '');

    // Save Resume document in MongoDB
    const resume = await Resume.create({
      user: req.user._id,
      title,
      originalFileName: req.file.originalname,
      fileUrl,
      filePublicId,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      contact: parsedData.contact,
      summary: parsedData.summary,
      skills: parsedData.skills,
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
      data: parsedData,
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
      title, contact, summary, skills,
      education, experience, projects, certifications
    } = req.body;

    if (title) resume.title = title;
    if (contact) resume.contact = { ...resume.contact, ...contact };
    if (summary !== undefined) resume.summary = summary;
    if (skills) resume.skills = skills;
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
        contact: targetVersion.contact,
        summary: targetVersion.summary,
        skills: targetVersion.skills,
        experience: targetVersion.experience,
        projects: targetVersion.projects,
        education: targetVersion.education,
        certifications: targetVersion.certifications
      };
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
  generatePdf
};



