const Resume = require('../../models/Resume');
const JobDescription = require('../../models/JobDescription');
const JobMatch = require('../../models/JobMatch');
const keywordService = require('../ats/keywordService');

// Weighted scoring distribution (Total 100 points)
const WEIGHTS = {
  skills: 35,
  keywords: 25,
  experience: 15,
  education: 10,
  projects: 15
};

const matchResumeToJob = async (resumeId, jobDescriptionId, userId) => {
  // 1. Fetch & Verify Ownership
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  const jd = await JobDescription.findOne({ _id: jobDescriptionId, user: userId });
  if (!jd) throw new Error('Job description not found or unauthorized');

  // 2. Skill Matching (Required vs Preferred)
  const resumeSkills = resume.skills || [];
  const requiredSkills = jd.requiredSkills || [];
  const preferredSkills = jd.preferredSkills || [];

  const requiredMatch = keywordService.compareSkills(resumeSkills, requiredSkills);
  const preferredMatch = keywordService.compareSkills(resumeSkills, preferredSkills);

  const skillsScore = Math.round(WEIGHTS.skills * requiredMatch.ratio);

  // 3. Keyword Matching
  const resumeText = resume.extractedText || `${resume.summary} ${resume.skills.join(' ')}`;
  const jdKeywords = jd.keywords && jd.keywords.length > 0
    ? jd.keywords
    : keywordService.extractKeywords(jd.description || jd.rawText || jd.title);

  const resumeKeywords = keywordService.extractKeywords(resumeText);
  const keywordMatch = keywordService.compareKeywords(resumeKeywords, jdKeywords);

  const keywordsScore = Math.round(WEIGHTS.keywords * keywordMatch.ratio);

  // 4. Experience Matching
  const expResult = evaluateExperience(resume.experience || [], jd.experience);
  const experienceScore = Math.round(WEIGHTS.experience * expResult.ratio);

  // 5. Education Matching
  const eduResult = evaluateEducation(resume.education || [], jd.education);
  const educationScore = Math.round(WEIGHTS.education * eduResult.ratio);

  // 6. Project Relevance Matching
  const projResult = evaluateProjects(resume.projects || [], requiredSkills, jdKeywords);
  const projectsScore = Math.round(WEIGHTS.projects * projResult.ratio);

  // 7. Calculate Bounded Match Percentage
  const matchPercentage = Math.min(
    100,
    Math.max(0, skillsScore + keywordsScore + experienceScore + educationScore + projectsScore)
  );

  // 8. Generate Deterministic Strengths, Gaps & Suggestions
  const strengths = generateStrengths(requiredMatch, preferredMatch, keywordMatch, expResult, projResult);
  const gaps = generateGaps(requiredMatch, preferredMatch, keywordMatch, expResult, eduResult);
  const suggestions = generateSuggestions(requiredMatch, preferredMatch, keywordMatch, projResult);

  // 9. Save JobMatch document in MongoDB
  const jobMatch = await JobMatch.create({
    user: userId,
    resume: resume._id,
    jobDescription: jd._id,
    matchPercentage,
    breakdown: {
      skills: skillsScore,
      keywords: keywordsScore,
      experience: experienceScore,
      education: educationScore,
      projects: projectsScore
    },
    matchedSkills: requiredMatch.matched,
    missingSkills: requiredMatch.missing,
    missingPreferredSkills: preferredMatch.missing,
    matchedKeywords: keywordMatch.matched,
    missingKeywords: keywordMatch.missing,
    experienceMatch: { score: experienceScore, status: expResult.status },
    educationMatch: { score: educationScore, status: eduResult.status },
    projectRelevance: { score: projectsScore },
    strengths,
    gaps,
    suggestions
  });

  return jobMatch;
};

const getMatchHistory = async (userId) => {
  return JobMatch.find({ user: userId })
    .populate('resume', 'title originalFileName')
    .populate('jobDescription', 'title company')
    .sort({ createdAt: -1 });
};

const getMatchById = async (id, userId) => {
  const match = await JobMatch.findOne({ _id: id, user: userId })
    .populate('resume', 'title originalFileName')
    .populate('jobDescription', 'title company');

  if (!match) throw new Error('Job match result not found');
  return match;
};

// Helper: Experience evaluation
const evaluateExperience = (userExp = [], jdExpStr = '') => {
  if (!jdExpStr || jdExpStr.toLowerCase() === 'not specified') {
    return { ratio: 1.0, status: 'not_specified' };
  }

  const expCount = userExp.length;
  if (expCount >= 2) return { ratio: 1.0, status: 'match' };
  if (expCount === 1) return { ratio: 0.8, status: 'partial' };
  return { ratio: 0.5, status: 'partial' }; // Fresher/Student friendly baseline
};

// Helper: Education evaluation
const evaluateEducation = (userEdu = [], jdEduStr = '') => {
  if (!jdEduStr || jdEduStr.toLowerCase() === 'not specified') {
    return { ratio: 1.0, status: 'not_specified' };
  }

  if (userEdu.length > 0) {
    return { ratio: 1.0, status: 'match' };
  }

  return { ratio: 0.5, status: 'not_specified' };
};

// Helper: Project relevance evaluation
const evaluateProjects = (userProjects = [], requiredSkills = [], jdKeywords = []) => {
  if (userProjects.length === 0) return { ratio: 0.3 };

  const targetSet = new Set(
    [...requiredSkills, ...jdKeywords].map(s => keywordService.normalizeKeyword(s))
  );

  if (targetSet.size === 0) return { ratio: 1.0 };

  let matchedProjectCount = 0;
  userProjects.forEach(p => {
    const pText = `${p.name || ''} ${p.description || ''} ${(p.technologies || []).join(' ')}`.toLowerCase();
    const hasMatch = Array.from(targetSet).some(k => k && pText.includes(k));
    if (hasMatch) matchedProjectCount++;
  });

  const ratio = Math.min(1.0, (matchedProjectCount / Math.max(1, userProjects.length)) + 0.3);
  return { ratio };
};

const generateStrengths = (reqSkills, prefSkills, keywords, exp, proj) => {
  const list = [];
  if (reqSkills.matched.length > 0) {
    list.push(`Matches ${reqSkills.matched.length} core required skills (${reqSkills.matched.slice(0, 3).join(', ')})`);
  }
  if (prefSkills.matched.length > 0) {
    list.push(`Matches preferred bonus skills: ${prefSkills.matched.join(', ')}`);
  }
  if (keywords.matched.length > 0) {
    list.push(`Strong alignment on tech keywords (${keywords.matched.length} matched)`);
  }
  if (proj.ratio >= 0.7) {
    list.push('Relevant projects demonstrate key job technologies');
  }
  return list.length > 0 ? list : ['Good overall profile alignment'];
};

const generateGaps = (reqSkills, prefSkills, keywords, exp, edu) => {
  const list = [];
  if (reqSkills.missing.length > 0) {
    list.push(`Missing required skills: ${reqSkills.missing.slice(0, 4).join(', ')}`);
  }
  if (prefSkills.missing.length > 0) {
    list.push(`Missing preferred skills: ${prefSkills.missing.slice(0, 3).join(', ')}`);
  }
  if (keywords.missing.length > 0) {
    list.push(`Low coverage for job keywords (${keywords.missing.slice(0, 3).join(', ')})`);
  }
  return list;
};

const generateSuggestions = (reqSkills, prefSkills, keywords, proj) => {
  const list = [];
  if (reqSkills.missing.length > 0) {
    list.push(`If you have experience with ${reqSkills.missing.slice(0, 3).join(', ')}, ensure they are listed in your skills section.`);
  }
  if (keywords.missing.length > 0) {
    list.push(`Review missing keywords (${keywords.missing.slice(0, 3).join(', ')}) and incorporate relevant terms into project descriptions where truthful.`);
  }
  if (proj.ratio < 0.7) {
    list.push('Highlight project features and personal contributions that use the required job technologies.');
  }
  return list;
};

module.exports = {
  matchResumeToJob,
  getMatchHistory,
  getMatchById,
  WEIGHTS
};

