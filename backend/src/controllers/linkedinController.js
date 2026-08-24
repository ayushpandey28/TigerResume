const linkedinService = require('../services/profile/linkedinService');
const { success, error } = require('../utils/response');

const analyzeProfile = async (req, res, next) => {
  try {
    const { profileUrl, headline, about, skills, experience, education, projects } = req.body;

    if (!profileUrl) {
      return error(res, 'LinkedIn profile URL is required', 400);
    }

    const result = await linkedinService.analyzeLinkedInProfile({
      profileUrl, headline, about, skills, experience, education, projects
    }, req.user._id);

    return success(res, result, 'LinkedIn profile analyzed successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await linkedinService.getLinkedInHistory(req.user._id);
    return success(res, history, 'LinkedIn analysis history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const analysis = await linkedinService.getLinkedInAnalysisById(req.params.id, req.user._id);
    return success(res, analysis, 'LinkedIn analysis retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeProfile,
  getHistory,
  getById
};

