const skillGapService = require('../services/job/skillGap');
const { success, error } = require('../utils/response');

const analyzeSkillGap = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    if (!resumeId || !jobDescriptionId) {
      return error(res, 'Both resumeId and jobDescriptionId are required', 400);
    }

    const gapResult = await skillGapService.analyzeSkillGap(resumeId, jobDescriptionId, req.user._id);
    return success(res, gapResult, 'Skill gap analysis completed successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await skillGapService.getSkillGapHistory(req.user._id);
    return success(res, history, 'Skill gap history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const gap = await skillGapService.getSkillGapById(req.params.id, req.user._id);
    return success(res, gap, 'Skill gap retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeSkillGap,
  getHistory,
  getById
};

