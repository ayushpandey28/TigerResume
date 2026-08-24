const keywordService = require('./keywordService');
const { calculateScore } = require('./scoreCalculator');

const calculateATSScore = async (resume, jobDescription = null) => {
  if (!resume) {
    throw new Error('Resume object is required for ATS analysis');
  }

  // 1. Analyze Contact Information
  const contactAnalysis = analyzeContact(resume.contact);

  // 2. Analyze Sections
  const sectionAnalysis = analyzeSections(resume);

  // 3. Analyze Formatting & ATS Safety
  const formattingAnalysis = analyzeFormatting(resume);

  // 4. Keyword & Skill Analysis
  let keywordMatchResult = { matched: [], missing: [], ratio: 1.0 };
  let skillMatchResult = { matched: resume.skills || [], missing: [], ratio: 1.0 };
  const hasJobDescription = !!(jobDescription && (jobDescription.parsedData || jobDescription.rawText));

  if (hasJobDescription) {
    const jdText = jobDescription.rawText || '';
    const jdSkills = jobDescription.parsedData?.requiredSkills || extractSkillsFromText(jdText);
    const jdKeywords = jobDescription.parsedData?.keywords || keywordService.extractKeywords(jdText);

    keywordMatchResult = keywordService.compareKeywords(
      keywordService.extractKeywords(resume.extractedText || ''),
      jdKeywords
    );

    skillMatchResult = keywordService.compareSkills(
      resume.skills || [],
      jdSkills
    );
  } else {
    // Mode 1: Resume-only evaluation
    const skillCount = (resume.skills || []).length;
    skillMatchResult.ratio = Math.min(1.0, skillCount / 6); // 6+ skills gives 100% skill richness
  }

  // 5. Calculate Score
  const scoreResult = calculateScore({
    hasJobDescription,
    keywordRatio: keywordMatchResult.ratio,
    skillsRatio: skillMatchResult.ratio,
    structureScore: sectionAnalysis.ratio,
    formattingScore: formattingAnalysis.ratio,
    contactScore: contactAnalysis.ratio,
    sectionsScore: sectionAnalysis.ratio
  });

  // 6. Generate Deterministic Strengths, Weaknesses & Suggestions
  const strengths = generateStrengths(contactAnalysis, sectionAnalysis, formattingAnalysis, skillMatchResult, keywordMatchResult, hasJobDescription);
  const weaknesses = generateWeaknesses(contactAnalysis, sectionAnalysis, formattingAnalysis, skillMatchResult, keywordMatchResult, hasJobDescription);
  const suggestions = generateSuggestions(contactAnalysis, sectionAnalysis, formattingAnalysis, skillMatchResult, keywordMatchResult, hasJobDescription);

  return {
    overallScore: scoreResult.overallScore,
    breakdown: scoreResult.breakdown,
    matchedKeywords: keywordMatchResult.matched,
    missingKeywords: keywordMatchResult.missing,
    matchedSkills: skillMatchResult.matched,
    missingSkills: skillMatchResult.missing,
    strengths,
    weaknesses,
    suggestions,
    contactAnalysis,
    sectionAnalysis,
    formattingAnalysis
  };
};

const analyzeContact = (contact = {}) => {
  const fields = [
    { name: 'name', weight: 3, present: !!contact.name },
    { name: 'email', weight: 3, present: !!contact.email },
    { name: 'phone', weight: 2, present: !!contact.phone },
    { name: 'linkedin', weight: 1, present: !!contact.linkedin },
    { name: 'github', weight: 1, present: !!contact.github }
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const earnedWeight = fields.reduce((sum, f) => sum + (f.present ? f.weight : 0), 0);

  const present = fields.filter(f => f.present).map(f => f.name);
  const missing = fields.filter(f => !f.present).map(f => f.name);

  return {
    ratio: earnedWeight / totalWeight,
    present,
    missing
  };
};

const analyzeSections = (resume) => {
  const presentSections = [];
  const missingSections = [];

  if (resume.summary && resume.summary.length > 20) presentSections.push('summary');
  else missingSections.push('summary');

  if (resume.skills && resume.skills.length > 0) presentSections.push('skills');
  else missingSections.push('skills');

  if (resume.education && resume.education.length > 0) presentSections.push('education');
  else missingSections.push('education');

  if ((resume.experience && resume.experience.length > 0) || (resume.projects && resume.projects.length > 0)) {
    presentSections.push('experience_or_projects');
  } else {
    missingSections.push('experience_or_projects');
  }

  const ratio = presentSections.length / 4; // 4 core sections
  return { ratio, presentSections, missingSections };
};

const analyzeFormatting = (resume) => {
  const issues = [];
  let score = 1.0;

  const textLength = (resume.extractedText || '').length;

  if (textLength < 150) {
    issues.push('Resume text is unusually short');
    score -= 0.3;
  }

  if (!resume.contact || !resume.contact.email) {
    issues.push('Email contact information not detectable');
    score -= 0.2;
  }

  if (!resume.skills || resume.skills.length === 0) {
    issues.push('Skills section not detected');
    score -= 0.2;
  }

  return {
    ratio: Math.max(0, score),
    issues: issues.length === 0 ? ['Text extracted cleanly', 'No formatting issues detected'] : issues
  };
};

const extractSkillsFromText = (text) => {
  return keywordService.extractKeywords(text);
};

const generateStrengths = (contact, sections, formatting, skills, keywords, hasJD) => {
  const list = [];
  if (contact.present.includes('email') && contact.present.includes('phone')) {
    list.push('Complete primary contact details (Email and Phone present)');
  }
  if (contact.present.includes('linkedin')) {
    list.push('LinkedIn profile link included for recruiter verification');
  }
  if (sections.presentSections.includes('skills')) {
    list.push('Dedicated skills section detected');
  }
  if (sections.presentSections.includes('experience_or_projects')) {
    list.push('Relevant work experience or project section included');
  }
  if (hasJD && skills.ratio >= 0.6) {
    list.push(`High skill compatibility (${Math.round(skills.ratio * 100)}% match)`);
  }
  if (hasJD && keywords.ratio >= 0.6) {
    list.push(`Strong keyword alignment with target job description`);
  }
  return list.length > 0 ? list : ['Clean PDF layout and text readability'];
};

const generateWeaknesses = (contact, sections, formatting, skills, keywords, hasJD) => {
  const list = [];
  if (contact.missing.includes('linkedin')) {
    list.push('Missing LinkedIn profile link');
  }
  if (contact.missing.includes('github')) {
    list.push('Missing GitHub profile link for technical portfolio');
  }
  if (sections.missingSections.includes('summary')) {
    list.push('Missing professional summary or objective');
  }
  if (hasJD && skills.missing.length > 0) {
    list.push(`Missing key required skills: ${skills.missing.slice(0, 4).join(', ')}`);
  }
  if (hasJD && keywords.missing.length > 0) {
    list.push(`Low coverage for specific job keywords`);
  }
  return list;
};

const generateSuggestions = (contact, sections, formatting, skills, keywords, hasJD) => {
  const list = [];
  if (contact.missing.includes('linkedin')) {
    list.push('Add your LinkedIn profile link in the contact header.');
  }
  if (hasJD && skills.missing.length > 0) {
    list.push(`Review missing skills (${skills.missing.slice(0, 3).join(', ')}) and highlight relevant coursework or projects if you possess them.`);
  }
  if (hasJD && keywords.missing.length > 0) {
    list.push('Incorporate relevant keywords from the job description naturally into your summary and project descriptions.');
  }
  if (sections.missingSections.includes('summary')) {
    list.push('Add a concise 2-3 sentence professional summary at the top of your resume.');
  }
  return list;
};

module.exports = { calculateATSScore };

