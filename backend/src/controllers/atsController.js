const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const ATSResult = require('../models/ATSResult');
const { calculateATSScore } = require('../services/ats/atsService');
const { success, error } = require('../utils/response');

const calculateScore = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId, jobText } = req.body;

    if (!resumeId) {
      return error(res, 'Resume ID is required for ATS analysis', 400);
    }

    // Verify resume ownership
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return error(res, 'Resume not found or unauthorized', 404);
    }

    let jobDescription = null;
    if (jobDescriptionId) {
      jobDescription = await JobDescription.findOne({ _id: jobDescriptionId, user: req.user._id });
      if (!jobDescription) {
        return error(res, 'Job description not found or unauthorized', 404);
      }
    } else if (jobText && jobText.trim()) {
      jobDescription = { rawText: jobText.trim(), parsedData: null };
    }

    // Perform rule-based ATS analysis
    const analysis = await calculateATSScore(resume, jobDescription);

    // Save ATSResult in MongoDB
    const atsResult = await ATSResult.create({
      user: req.user._id,
      resume: resume._id,
      jobDescription: jobDescription && jobDescription._id ? jobDescription._id : null,
      overallScore: analysis.overallScore,
      breakdown: analysis.breakdown,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions
    });

    return success(res, {
      id: atsResult._id,
      resumeId: resume._id,
      overallScore: analysis.overallScore,
      breakdown: analysis.breakdown,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
      createdAt: atsResult.createdAt
    }, 'ATS compatibility score calculated successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await ATSResult.find({ user: req.user._id })
      .populate('resume', 'title originalFileName')
      .sort({ createdAt: -1 });

    return success(res, history, 'ATS history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getScore = async (req, res, next) => {
  try {
    const result = await ATSResult.findOne({ _id: req.params.id, user: req.user._id })
      .populate('resume', 'title originalFileName');

    if (!result) {
      return error(res, 'ATS result not found', 404);
    }

    return success(res, result, 'ATS result retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { calculateScore, getHistory, getScore };

