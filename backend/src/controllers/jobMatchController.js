const jobMatchService = require('../services/job/jobMatch');
const { success, error } = require('../utils/response');

const matchJob = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    if (!resumeId || !jobDescriptionId) {
      return error(res, 'Both resumeId and jobDescriptionId are required', 400);
    }

    const matchResult = await jobMatchService.matchResumeToJob(resumeId, jobDescriptionId, req.user._id);
    return success(res, matchResult, 'Resume to job match calculated successfully');
  } catch (err) {
    next(err);
  }
};

const getMatches = async (req, res, next) => {
  try {
    const history = await jobMatchService.getMatchHistory(req.user._id);
    return success(res, history, 'Job match history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getMatch = async (req, res, next) => {
  try {
    const match = await jobMatchService.getMatchById(req.params.id, req.user._id);
    return success(res, match, 'Job match retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { matchJob, getMatches, getMatch };

