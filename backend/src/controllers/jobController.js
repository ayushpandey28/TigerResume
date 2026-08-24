const jobService = require('../services/job/jobDescription');
const { success, error } = require('../utils/response');

const createJob = async (req, res, next) => {
  try {
    const jd = await jobService.createJobDescription(req.body, req.user._id);
    return success(res, jd, 'Job description created successfully', 201);
  } catch (err) { next(err); }
};

const getJobs = async (req, res, next) => {
  try {
    const jds = await jobService.getJobDescriptions(req.user._id);
    return success(res, jds, 'Job descriptions retrieved successfully');
  } catch (err) { next(err); }
};

const getJob = async (req, res, next) => {
  try {
    const jd = await jobService.getJobDescriptionById(req.params.id, req.user._id);
    return success(res, jd, 'Job description retrieved successfully');
  } catch (err) { next(err); }
};

const updateJob = async (req, res, next) => {
  try {
    const jd = await jobService.updateJobDescription(req.params.id, req.body, req.user._id);
    return success(res, jd, 'Job description updated successfully');
  } catch (err) { next(err); }
};

const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJobDescription(req.params.id, req.user._id);
    return success(res, null, 'Job description deleted successfully');
  } catch (err) { next(err); }
};

const analyzeJob = async (req, res, next) => {
  try {
    const result = await jobService.analyzeJobDescription(req.params.id, req.user._id);
    return success(res, result, 'Job description analyzed successfully');
  } catch (err) { next(err); }
};

const generateJob = async (req, res, next) => {
  try {
    const result = await jobService.generateJobDescription(req.body, req.user._id);
    return success(res, result, 'Sample job description generated successfully');
  } catch (err) { next(err); }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  analyzeJob,
  generateJob
};

