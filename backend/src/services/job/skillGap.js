const Resume = require('../../models/Resume');
const JobDescription = require('../../models/JobDescription');
const SkillGap = require('../../models/SkillGap');
const keywordService = require('../ats/keywordService');

const analyzeSkillGap = async (resumeId, jobDescriptionId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  const jd = await JobDescription.findOne({ _id: jobDescriptionId, user: userId });
  if (!jd) throw new Error('Job description not found or unauthorized');

  const listedSkills = resume.skills || [];
  const projectTechs = [];
  (resume.projects || []).forEach(p => {
    if (Array.isArray(p.technologies)) {
      projectTechs.push(...p.technologies);
    }
  });

  const existingSkillsMap = new Map();
  [...listedSkills, ...projectTechs].forEach(s => {
    if (!s) return;
    const norm = keywordService.normalizeKeyword(s);
    if (norm && !existingSkillsMap.has(norm)) {
      existingSkillsMap.set(norm, s);
    }
  });
  const existingSkills = Array.from(existingSkillsMap.values());

  const requiredSkills = jd.requiredSkills || [];
  const preferredSkills = jd.preferredSkills || [];

  const requiredMatch = keywordService.compareSkills(existingSkills, requiredSkills);
  const preferredMatch = keywordService.compareSkills(existingSkills, preferredSkills);

  const skillCoverage = requiredSkills.length > 0
    ? Math.min(100, Math.round((requiredMatch.matched.length / requiredSkills.length) * 100))
    : 100;

  const gaps = [];

  requiredMatch.missing.forEach((skill, idx) => {
    gaps.push({
      skill,
      type: 'required',
      priority: idx < 2 ? 'high' : 'medium',
      reason: `${skill} is listed as a core required skill in the job description.`
    });
  });

  preferredMatch.missing.forEach(skill => {
    gaps.push({
      skill,
      type: 'preferred',
      priority: 'low',
      reason: `${skill} is listed as a preferred/bonus skill.`
    });
  });

  const missingAll = [...requiredMatch.missing, ...preferredMatch.missing];
  const roadmap = missingAll.map((skill, idx) => {
    const isRequired = requiredMatch.missing.includes(skill);
    const priority = isRequired ? (idx < 2 ? 'high' : 'medium') : 'low';

    return {
      skill,
      priority,
      steps: [
        `Learn ${skill} fundamentals and core syntax/concepts`,
        `Build a hands-on exercise incorporating ${skill}`,
        `Integrate ${skill} into a practical full-stack or backend project`,
        `Demonstrate ${skill} experience in your project portfolio`
      ]
    };
  });

  const skillGap = await SkillGap.create({
    user: userId,
    resume: resume._id,
    jobDescription: jd._id,
    existingSkills,
    requiredSkills,
    preferredSkills,
    matchedRequiredSkills: requiredMatch.matched,
    missingRequiredSkills: requiredMatch.missing,
    matchedPreferredSkills: preferredMatch.matched,
    missingPreferredSkills: preferredMatch.missing,
    skillCoverage,
    gaps,
    roadmap
  });

  return skillGap;
};

const getSkillGapHistory = async (userId) => {
  return SkillGap.find({ user: userId })
    .populate('resume', 'title originalFileName')
    .populate('jobDescription', 'title company')
    .sort({ createdAt: -1 });
};

const getSkillGapById = async (id, userId) => {
  const gap = await SkillGap.findOne({ _id: id, user: userId })
    .populate('resume', 'title originalFileName')
    .populate('jobDescription', 'title company');

  if (!gap) throw new Error('Skill gap analysis not found');
  return gap;
};

module.exports = {
  analyzeSkillGap,
  getSkillGapHistory,
  getSkillGapById
};
