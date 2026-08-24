const resumeOptimizer = require('../services/resume/resumeOptimizer');
const { success, error } = require('../utils/response');

const analyzeImprovement = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    if (!resumeId) {
      return error(res, 'Resume ID is required', 400);
    }

    const result = await resumeOptimizer.analyzeImprovement(resumeId, jobDescriptionId, req.user._id);
    return success(res, result, 'Resume optimization analysis completed successfully');
  } catch (err) {
    next(err);
  }
};

const applyImprovement = async (req, res, next) => {
  try {
    const { resumeId, originalVersion, acceptedChanges } = req.body;

    if (!resumeId || !acceptedChanges) {
      return error(res, 'Resume ID and accepted changes are required', 400);
    }

    const result = await resumeOptimizer.applyImprovement(
      { resumeId, originalVersion, acceptedChanges },
      req.user._id
    );

    return success(res, result, 'Resume optimization applied successfully and new version created');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeImprovement,
  applyImprovement,
  optimizeResume: analyzeImprovement
};

