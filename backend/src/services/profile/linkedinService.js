const ProfileAnalysis = require('../../models/ProfileAnalysis');
const aiService = require('../ai/aiService');

const analyzeLinkedInProfile = async (
  {
    profileUrl,
    headline = '',
    about = '',
    skills = [],
    experience = [],
    education = [],
    projects = []
  },
  userId
) => {
  // ---------------------------------------------------------
  // 1. VALIDATE LINKEDIN URL
  // ---------------------------------------------------------

  if (!profileUrl || typeof profileUrl !== 'string') {
    throw new Error('Valid LinkedIn profile URL is required');
  }

  const cleanUrl = profileUrl.trim();

  let parsedUrl;

  try {
    parsedUrl = new URL(cleanUrl);
  } catch {
    throw new Error('Please provide a valid LinkedIn profile URL');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (
    hostname !== 'linkedin.com' &&
    !hostname.endsWith('.linkedin.com')
  ) {
    throw new Error(
      'Please provide a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username/)'
    );
  }

  // ---------------------------------------------------------
  // 2. NORMALIZE DATA
  // ---------------------------------------------------------

  const cleanHeadline =
    typeof headline === 'string'
      ? headline.trim()
      : '';

  const cleanAbout =
    typeof about === 'string'
      ? about.trim()
      : '';

  const cleanSkills =
    Array.isArray(skills)
      ? skills
      : [];

  const cleanExperience =
    Array.isArray(experience)
      ? experience
      : [];

  const cleanEducation =
    Array.isArray(education)
      ? education
      : [];

  const cleanProjects =
    Array.isArray(projects)
      ? projects
      : [];

  // ---------------------------------------------------------
  // 3. PROFILE COMPLETENESS
  // ---------------------------------------------------------

  let completeness = 0;

  if (cleanHeadline) completeness += 15;
  if (cleanAbout) completeness += 20;
  if (cleanSkills.length > 0) completeness += 20;
  if (cleanExperience.length > 0) completeness += 20;
  if (cleanEducation.length > 0) completeness += 15;
  if (cleanProjects.length > 0) completeness += 10;

  completeness = Math.min(completeness, 100);

  // ---------------------------------------------------------
  // 4. DETERMINISTIC ANALYSIS
  // ---------------------------------------------------------

  const strengths = [];
  const gaps = [];
  const suggestions = [];

  // HEADLINE
  if (cleanHeadline) {
    if (cleanHeadline.length >= 30) {
      strengths.push(
        'Headline clearly communicates professional identity and career direction.'
      );
    } else if (cleanHeadline.length >= 15) {
      strengths.push(
        'Headline provides a basic professional identity.'
      );

      suggestions.push(
        'Strengthen the headline by including your target role and 2-3 relevant technologies or areas of expertise.'
      );
    } else {
      gaps.push(
        'Headline is too short or generic.'
      );

      suggestions.push(
        'Expand the headline with your target role, strongest skills, and primary technologies.'
      );
    }
  } else {
    gaps.push(
      'LinkedIn headline is missing.'
    );

    suggestions.push(
      'Add a professional headline that clearly communicates your target role and strongest skills.'
    );
  }

  // ABOUT
  if (cleanAbout) {
    if (cleanAbout.length >= 300) {
      strengths.push(
        'About section provides a detailed professional summary.'
      );
    } else if (cleanAbout.length >= 100) {
      strengths.push(
        'About section provides a reasonable professional overview.'
      );

      suggestions.push(
        'Improve the About section by adding measurable achievements, important projects, technical strengths, and career goals.'
      );
    } else {
      gaps.push(
        'About section is too brief.'
      );

      suggestions.push(
        'Expand the About section with your background, technical strengths, projects, achievements, and career goals.'
      );
    }
  } else {
    gaps.push(
      'About section is missing.'
    );

    suggestions.push(
      'Write a professional About section covering your background, skills, projects, achievements, and career goals.'
    );
  }

  // SKILLS
  if (cleanSkills.length >= 10) {
    strengths.push(
      `Profile lists ${cleanSkills.length} skills, providing good skill coverage.`
    );
  } else if (cleanSkills.length >= 5) {
    strengths.push(
      `Profile lists ${cleanSkills.length} skills.`
    );

    suggestions.push(
      'Add more relevant technical and professional skills aligned with your target roles.'
    );
  } else if (cleanSkills.length > 0) {
    gaps.push(
      'Profile contains only a small number of skills.'
    );

    suggestions.push(
      'Add at least 10 relevant skills, prioritizing technologies and competencies required by your target roles.'
    );
  } else {
    gaps.push(
      'No skills are listed on the profile.'
    );

    suggestions.push(
      'Add relevant technical and professional skills matching your target job roles.'
    );
  }

  // EXPERIENCE
  if (cleanExperience.length >= 2) {
    strengths.push(
      `Profile contains ${cleanExperience.length} experience entries.`
    );
  } else if (cleanExperience.length === 1) {
    strengths.push(
      'Profile contains professional or internship experience.'
    );

    suggestions.push(
      'Add additional relevant experience, internships, freelance work, or practical project experience where applicable.'
    );
  } else {
    gaps.push(
      'Professional experience section is missing or empty.'
    );

    suggestions.push(
      'Add internships, employment, freelance work, volunteering, or relevant practical experience.'
    );
  }

  // EDUCATION
  if (cleanEducation.length > 0) {
    strengths.push(
      'Education information is present on the profile.'
    );
  } else {
    gaps.push(
      'Education information is missing.'
    );

    suggestions.push(
      'Add your degree, institution, field of study, and relevant academic information.'
    );
  }

  // PROJECTS
  if (cleanProjects.length >= 3) {
    strengths.push(
      `Profile includes ${cleanProjects.length} projects, demonstrating practical work.`
    );
  } else if (cleanProjects.length > 0) {
    strengths.push(
      'Profile includes project work.'
    );

    suggestions.push(
      'Add more relevant projects and describe technologies, your contribution, and measurable outcomes.'
    );
  } else {
    gaps.push(
      'No projects are listed on the profile.'
    );

    suggestions.push(
      'Add 2-4 strong projects with technologies used, your contribution, and measurable results.'
    );
  }

  // ---------------------------------------------------------
  // 5. AI ANALYSIS
  // ---------------------------------------------------------

  let aiAnalysis = null;

  if (aiService.isAIAvailable()) {
    aiAnalysis = await aiService.analyzeLinkedIn({
      profileUrl: cleanUrl,
      headline: cleanHeadline,
      about: cleanAbout,
      skills: cleanSkills,
      experience: cleanExperience,
      education: cleanEducation,
      projects: cleanProjects,
      completeness
    });
  }

  // ---------------------------------------------------------
  // 6. SAVE RESULT
  // ---------------------------------------------------------

  const analysisPayload = {
    profileType: 'linkedin',
    user: userId,
    profileUrl: cleanUrl,

    analysis: {
      profileUrl: cleanUrl,

      completeness,

      headline: cleanHeadline || 'Not provided',
      about: cleanAbout || 'Not provided',

      skillsCount: cleanSkills.length,
      experienceCount: cleanExperience.length,
      educationCount: cleanEducation.length,
      projectsCount: cleanProjects.length,

      strengths,
      gaps,
      suggestions,

      aiAnalysis:
        aiAnalysis?.available === false
          ? null
          : aiAnalysis
    }
  };

  const record =
    await ProfileAnalysis.create(analysisPayload);

  return record;
};

// ---------------------------------------------------------
// HISTORY
// ---------------------------------------------------------

const getLinkedInHistory = async (userId) => {
  return ProfileAnalysis
    .find({
      user: userId,
      profileType: 'linkedin'
    })
    .sort({ createdAt: -1 });
};

// ---------------------------------------------------------
// GET BY ID
// ---------------------------------------------------------

const getLinkedInAnalysisById = async (id, userId) => {
  const record =
    await ProfileAnalysis.findOne({
      _id: id,
      user: userId,
      profileType: 'linkedin'
    });

  if (!record) {
    throw new Error(
      'LinkedIn profile analysis not found'
    );
  }

  return record;
};

module.exports = {
  analyzeLinkedInProfile,
  getLinkedInHistory,
  getLinkedInAnalysisById
};