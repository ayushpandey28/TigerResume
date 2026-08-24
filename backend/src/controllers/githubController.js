const githubService = require('../services/profile/githubService');
const { success, error } = require('../utils/response');

const analyzeProfile = async (req, res, next) => {
  try {
    const input = req.body.username || req.body.url;

    if (!input) {
      return error(res, 'GitHub username or URL is required', 400);
    }

    const result = await githubService.analyzeGitHubProfile(input, req.user._id);
    return success(res, result, 'GitHub profile analyzed successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await githubService.getGitHubHistory(req.user._id);
    return success(res, history, 'GitHub analysis history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const analysis = await githubService.getGitHubAnalysisById(req.params.id, req.user._id);
    return success(res, analysis, 'GitHub analysis retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeProfile,
  getHistory,
  getById
};

