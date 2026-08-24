const ATSResult = require('../models/ATSResult');
const JobMatch = require('../models/JobMatch');
const SkillGap = require('../models/SkillGap');
const ProfileAnalysis = require('../models/ProfileAnalysis');
const ChatHistory = require('../models/ChatHistory');
const { success, error } = require('../utils/response');

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    const items = [];

    // 1. ATS History
    if (!type || type === 'ats') {
      const atsRecords = await ATSResult.find({ user: userId }).sort({ createdAt: -1 });
      atsRecords.forEach(r => {
        items.push({
          id: r._id,
          type: 'ats',
          title: `ATS Analysis - Score ${r.score}/100`,
          subtitle: `Found ${r.matchedKeywords?.length || 0} matched keywords, ${r.missingKeywords?.length || 0} missing`,
          score: r.score,
          createdAt: r.createdAt,
          details: r
        });
      });
    }

    // 2. Job Match History
    if (!type || type === 'job-match') {
      const matchRecords = await JobMatch.find({ user: userId }).populate('jobDescription', 'title company').sort({ createdAt: -1 });
      matchRecords.forEach(r => {
        items.push({
          id: r._id,
          type: 'job-match',
          title: `Job Match - ${r.matchPercentage}% Compatibility`,
          subtitle: `Target Job: ${r.jobDescription?.title || 'Job Description'} ${r.jobDescription?.company ? `(${r.jobDescription.company})` : ''}`,
          score: r.matchPercentage,
          createdAt: r.createdAt,
          details: r
        });
      });
    }

    // 3. Skill Gap History
    if (!type || type === 'skill-gap') {
      const gapRecords = await SkillGap.find({ user: userId }).populate('jobDescription', 'title').sort({ createdAt: -1 });
      gapRecords.forEach(r => {
        items.push({
          id: r._id,
          type: 'skill-gap',
          title: `Skill Gap Analysis - ${r.skillCoverage}% Coverage`,
          subtitle: `${r.gaps?.length || 0} identified skill gaps, ${r.roadmap?.length || 0} learning steps`,
          score: r.skillCoverage,
          createdAt: r.createdAt,
          details: r
        });
      });
    }

    // 4. GitHub & LinkedIn Profile Analysis History
    if (!type || type === 'github' || type === 'linkedin') {
      const profileQuery = { user: userId };
      if (type === 'github' || type === 'linkedin') profileQuery.profileType = type;

      const profileRecords = await ProfileAnalysis.find(profileQuery).sort({ createdAt: -1 });
      profileRecords.forEach(r => {
        items.push({
          id: r._id,
          type: r.profileType,
          title: `${r.profileType === 'github' ? 'GitHub' : 'LinkedIn'} Profile Analysis`,
          subtitle: r.profileType === 'github' ? `@${r.username} (${r.analysis?.metrics?.totalStars || 0} stars)` : `Completeness: ${r.analysis?.completeness || 0}%`,
          createdAt: r.createdAt,
          details: r
        });
      });
    }

    // 5. AI Chat History Sessions
    if (!type || type === 'chat') {
      const chatRecords = await ChatHistory.find({ user: userId }).populate('resume', 'title originalFileName').sort({ updatedAt: -1 });
      chatRecords.forEach(r => {
        items.push({
          id: r._id,
          type: 'chat',
          title: `AI Resume Chat Session`,
          subtitle: `Resume: ${r.resume?.title || r.resume?.originalFileName || 'Resume'} (${r.messages?.length || 0} messages)`,
          createdAt: r.updatedAt || r.createdAt,
          details: r
        });
      });
    }

    // Sort timeline by date descending
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return success(res, items, 'User activity history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check across models enforcing user ownership
    let item = await ATSResult.findOne({ _id: id, user: req.user._id });
    if (item) return success(res, { type: 'ats', data: item });

    item = await JobMatch.findOne({ _id: id, user: req.user._id }).populate('jobDescription');
    if (item) return success(res, { type: 'job-match', data: item });

    item = await SkillGap.findOne({ _id: id, user: req.user._id }).populate('jobDescription');
    if (item) return success(res, { type: 'skill-gap', data: item });

    item = await ProfileAnalysis.findOne({ _id: id, user: req.user._id });
    if (item) return success(res, { type: item.profileType, data: item });

    item = await ChatHistory.findOne({ _id: id, user: req.user._id }).populate('resume');
    if (item) return success(res, { type: 'chat', data: item });

    return error(res, 'History item not found', 404);
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory, getHistoryItem };

