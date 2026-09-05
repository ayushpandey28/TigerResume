const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const ATSResult = require('../models/ATSResult');
const JobMatch = require('../models/JobMatch');
const SkillGap = require('../models/SkillGap');
const ProfileAnalysis = require('../models/ProfileAnalysis');
const { success } = require('../utils/response');

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Load active resume, GitHub & LinkedIn profiles in parallel
    const [resume, githubProfile, linkedinProfile] = await Promise.all([
      Resume.findOne({ user: userId }).sort({ updatedAt: -1 }),
      ProfileAnalysis.findOne({ user: userId, profileType: 'github' }).sort({ createdAt: -1 }),
      ProfileAnalysis.findOne({ user: userId, profileType: 'linkedin' }).sort({ createdAt: -1 })
    ]);

    let latestVersion = null;
    let latestATS = null;
    let latestJobMatch = null;
    let latestSkillGap = null;

    if (resume) {
      [latestVersion, latestATS, latestJobMatch, latestSkillGap] = await Promise.all([
        ResumeVersion.findOne({ resume: resume._id }).sort({ version: -1 }),
        ATSResult.findOne({ resume: resume._id, user: userId }).sort({ createdAt: -1 }),
        JobMatch.findOne({ resume: resume._id, user: userId }).populate('jobDescription', 'title company').sort({ createdAt: -1 }),
        SkillGap.findOne({ resume: resume._id, user: userId }).populate('jobDescription', 'title').sort({ createdAt: -1 })
      ]);
    }

    // 3. Build Recent Activity Feed
    const activities = [];

    if (resume) {
      activities.push({
        type: 'resume',
        title: `Resume Updated: ${resume.title || resume.originalFileName}`,
        date: resume.updatedAt
      });
    }

    if (latestATS) {
      activities.push({
        type: 'ats',
        title: `ATS Analysis Score: ${latestATS.overallScore}/100`,
        date: latestATS.createdAt
      });
    }

    if (latestJobMatch) {
      activities.push({
        type: 'job-match',
        title: `Job Match Score: ${latestJobMatch.matchPercentage}% (${latestJobMatch.jobDescription?.title || 'Target Job'})`,
        date: latestJobMatch.createdAt
      });
    }

    if (latestSkillGap) {
      activities.push({
        type: 'skill-gap',
        title: `Skill Gap Coverage: ${latestSkillGap.skillCoverage}%`,
        date: latestSkillGap.createdAt
      });
    }

    if (githubProfile) {
      activities.push({
        type: 'github',
        title: `GitHub Profile Analyzed (@${githubProfile.username})`,
        date: githubProfile.createdAt
      });
    }

    if (linkedinProfile) {
      activities.push({
        type: 'linkedin',
        title: `LinkedIn Profile Analyzed (${linkedinProfile.analysis?.completeness || 0}% Complete)`,
        date: linkedinProfile.createdAt
      });
    }

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    return success(res, {
      resume: resume ? {
        id: resume._id,
        title: resume.title || resume.originalFileName,
        version: resume.currentVersion || 1,
        updatedAt: resume.updatedAt
      } : null,
      latestVersion: latestVersion ? {
        version: latestVersion.version,
        createdAt: latestVersion.createdAt
      } : null,
      latestATS: latestATS ? {
        score: latestATS.overallScore,
        createdAt: latestATS.createdAt
      } : null,
      latestJobMatch: latestJobMatch ? {
        matchPercentage: latestJobMatch.matchPercentage,
        jobTitle: latestJobMatch.jobDescription?.title || 'Target Job',
        createdAt: latestJobMatch.createdAt
      } : null,
      latestSkillGap: latestSkillGap ? {
        skillCoverage: latestSkillGap.skillCoverage,
        jobTitle: latestSkillGap.jobDescription?.title || 'Target Job',
        createdAt: latestSkillGap.createdAt
      } : null,
      recentActivity: activities.slice(0, 6)
    }, 'Dashboard summary retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary };
