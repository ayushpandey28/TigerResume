/**
 * TigerResume - Advanced Resume Parser
 * Parses raw extracted resume text into clean, robust structured data.
 * Supports flexible heading detection, categorized skills, separate project objects,
 * structured education, certifications, and contact information.
 */

const { normalizeResumeData, cleanBulletText } = require('../../utils/resumeNormalizer');

const parseResume = async (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return normalizeResumeData({});
  }

  const normalizedText = normalizeRawText(rawText);
  const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Identify section boundaries
  const { headerLines, sectionContent } = segmentSections(lines);

  // 2. Extract Contact Info from header and full text
  const contact = parseContactInfo(rawText, headerLines);

  // 3. Extract Summary
  const summary = parseSummary(sectionContent.summary || []);

  // 4. Extract Skills (Categorized & Flat)
  const { flatSkills, skillCategories } = parseSkills(sectionContent.skills || []);

  // 5. Extract Projects
  const projects = parseProjects(sectionContent.projects || []);

  // 6. Extract Education
  const education = parseEducation(sectionContent.education || []);

  // 7. Extract Experience & Internships/Training
  const experience = parseExperience(
    sectionContent.experience || [],
    sectionContent.internships || []
  );

  // 8. Extract Certifications
  const certifications = parseCertifications(sectionContent.certifications || []);

  // 9. Extract Achievements
  const achievements = parseAchievements(sectionContent.achievements || []);

  const rawStructured = {
    contact,
    summary,
    skills: flatSkills,
    skillCategories,
    education,
    experience,
    projects,
    certifications,
    achievements,
    extractedText: rawText
  };

  return normalizeResumeData(rawStructured);
};

// --- Text Normalization ---
const normalizeRawText = (text) => {
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\uFFFD/g, '')
    .replace(/%Ï/g, '\n')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    // Replace horizontal divider lines
    .replace(/^[-_=*~]{3,}$/gm, '');
};

// --- Section Detection ---
const SECTION_PATTERNS = {
  summary: /^(?:professional\s+summary|summary|profile|professional\s+profile|executive\s+summary|career\s+summary|about\s+me|career\s+objective|objective|personal\s+statement)$/i,
  skills: /^(?:technical\s+skills|skills|technologies|technical\s+proficiencies|technical\s+expertise|core\s+competencies|tech\s+stack|core\s+skills|skills\s+(?:&|and)\s+technologies|skills\s+(?:&|and)\s+abilities|tools\s+(?:&|and)\s+technologies|computer\s+skills|proficiencies|competencies|areas\s+of\s+expertise|programming\s+skills)$/i,
  projects: /^(?:projects|personal\s+projects|academic\s+projects|key\s+projects|technical\s+projects|selected\s+projects|featured\s+projects|(?:major|significant)\s+projects)$/i,
  experience: /^(?:work\s+experience|experience|professional\s+experience|employment\s+history|work\s+history|career\s+history|relevant\s+experience|professional\s+background|employment|practical\s+experience)$/i,
  education: /^(?:education|academic\s+background|educational\s+qualifications|academic\s+qualifications|qualifications|academic\s+history|education\s+(?:&|and)\s+training)$/i,
  certifications: /^(?:certifications|certificates|licenses\s+(?:&|and)\s+certifications|certifications\s+(?:&|and)\s+licenses|courses\s+(?:&|and)\s+certifications|professional\s+certifications|certifications\s+(?:&|and)\s+training)$/i,
  internships: /^(?:internships?|internship\s+experience|training|training\s+(?:&|and)\s+internships?|training\s*\/\s*internships?|industrial\s+training|virtual\s+internship|apprenticeship)$/i,
  achievements: /^(?:achievements|awards|awards\s+(?:&|and)\s+achievements|honors\s+(?:&|and)\s+awards|accomplishments|key\s+achievements)$/i,
  publications: /^(?:publications|research\s+publications|research\s+papers)$/i,
  languages: /^(?:languages|languages\s+known)$/i,
  volunteer: /^(?:volunteer\s+experience|volunteering|extracurricular\s+activities)$/i
};

const detectSectionHeading = (line) => {
  if (!line || typeof line !== 'string') return null;

  const trimmed = line.trim();
  if (trimmed.length > 50 || trimmed.length < 2) return null;

  // Headings usually do not end with a period or semicolon
  if (trimmed.endsWith('.') || trimmed.endsWith(';')) return null;

  // Clean heading: strip markdown headers, Roman numerals ("I. "), numbers ("1. "), letters ("A. "), leading/trailing bullets/dashes/colons
  const cleaned = trimmed
    .replace(/^#+\s*/, '')
    .replace(/^(?:(?:\d+|[A-Za-z]|[IVXLCDMivxlcdm]+)[.)]|\([^)]+\))\s*/, '')
    .replace(/^[-–—•●▪◦⁃‣*○\u25CB\s]+/, '')
    .replace(/[:\-–—\s]+$/, '')
    .trim();

  if (!cleaned) return null;

  for (const [sectionKey, regex] of Object.entries(SECTION_PATTERNS)) {
    if (regex.test(cleaned)) {
      return sectionKey;
    }
  }

  return null;
};

const segmentSections = (lines) => {
  const headerLines = [];
  const sectionContent = {};
  let currentSection = null;

  lines.forEach(line => {
    const heading = detectSectionHeading(line);

    if (heading) {
      currentSection = heading;
      if (!sectionContent[currentSection]) {
        sectionContent[currentSection] = [];
      }
    } else if (currentSection) {
      sectionContent[currentSection].push(line);
    } else {
      headerLines.push(line);
    }
  });

  return { headerLines, sectionContent };
};

// --- Contact Information Parser ---
const parseContactInfo = (rawText, headerLines) => {
  // 1. Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].trim() : '';

  // 2. Phone: search headerLines first with strict digit validation to avoid matching year ranges (e.g. 2024-2028)
  const extractPhone = (text) => {
    const phoneCandidates = text.match(/(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4,5}/g) || [];
    for (const cand of phoneCandidates) {
      const digitsOnly = cand.replace(/\D/g, '');
      // Valid phone numbers are 9-15 digits
      if (digitsOnly.length >= 9 && digitsOnly.length <= 15) {
        // Exclude year ranges like 2024-2028
        if (!/^(?:19|20)\d{2}[-–—to]+(?:19|20)\d{2}$/.test(cand.trim())) {
          return cand.trim();
        }
      }
    }
    return '';
  };

  const headerText = headerLines.join('\n');
  const phone = extractPhone(headerText) || extractPhone(rawText);

  // 3. LinkedIn
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([a-zA-Z0-9%_-]+(?:\/[a-zA-Z0-9%_-]+)*)/i);
  let linkedin = '';
  if (linkedinMatch) {
    linkedin = linkedinMatch[0].replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  }

  // 4. GitHub
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9%_-]+)/i);
  let github = '';
  if (githubMatch) {
    github = githubMatch[0].replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  }

  // 5. Portfolio / Website
  let website = '';
  const websiteRegex = /(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:[^\s)]*)|\b([a-zA-Z0-9-]{3,}\.(?:vercel\.app|netlify\.app|github\.io|dev|me|io|site|online))\b(?:[\/\w.-]*)/gi;
  const websiteMatches = rawText.match(websiteRegex) || [];

  for (const match of websiteMatches) {
    const cleanUrl = match.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    const emailDomain = email ? email.split('@')[1] : '';
    // Ignore linkedin, github, email provider domains, degree abbreviations (B.Tech)
    const isEmailDomain = emailDomain && cleanUrl.toLowerCase().startsWith(emailDomain.toLowerCase());
    const isCommonEmailHost = /^(?:gmail|yahoo|hotmail|outlook|proton|icloud|mail)\./i.test(cleanUrl);
    const isDegreeAbbr = /^[bm]\.(?:tech|e|sc)|ph\.d/i.test(cleanUrl);

    if (
      !match.includes('linkedin') &&
      !match.includes('github') &&
      !isEmailDomain &&
      !isCommonEmailHost &&
      !isDegreeAbbr
    ) {
      website = match;
      break;
    }
  }

  // 6. Name extraction from headerLines
  // Checks entire line or first token before separator '|' or '•'
  let name = '';
  for (const line of headerLines) {
    const cleanLine = line.trim();
    const candidateNamePart = cleanLine.split(/[|•·/]/)[0].trim();

    if (
      candidateNamePart.length >= 2 &&
      candidateNamePart.length <= 40 &&
      !candidateNamePart.includes('@') &&
      !candidateNamePart.includes('http') &&
      !candidateNamePart.includes('linkedin') &&
      !candidateNamePart.includes('github') &&
      !/\d{4,}/.test(candidateNamePart) &&
      !detectSectionHeading(candidateNamePart)
    ) {
      name = candidateNamePart.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').trim();
      if (name) break;
    }
  }

  // 7. Location extraction
  let location = '';
  for (const line of headerLines) {
    const parts = line.split(/[|•·/]/).map(p => p.trim());
    for (const part of parts) {
      const partWithoutZip = part.replace(/\b\d{5}(?:-\d{4})?\b|\b\d{6}\b/, '').trim();
      if (
        part &&
        part !== name &&
        !part.includes('@') &&
        !part.includes('http') &&
        !part.includes('linkedin') &&
        !part.includes('github') &&
        (/^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(partWithoutZip) || /^(?:new delhi|delhi|noida|gurugram|ghaziabad|mumbai|bangalore|bengaluru|hyderabad|pune|chennai|kolkata|san francisco|new york|london|seattle|austin|remote)/i.test(partWithoutZip))
      ) {
        location = part;
        break;
      }
    }
    if (location) break;
  }

  return { name, email, phone, location, linkedin, github, website };
};

// --- Summary Parser ---
const parseSummary = (lines) => {
  if (!lines || lines.length === 0) return '';

  const paragraphs = [];
  let currentPara = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
    } else {
      currentPara.push(trimmed);
    }
  });

  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }

  return paragraphs.join('\n\n');
};

// --- Skills Parser ---
const parseSkills = (lines) => {
  const skillCategories = [];
  const flatSkillsSet = new Set();

  let currentCategory = null;
  let currentCategorySkills = [];

  const flushCategory = () => {
    if (currentCategory && currentCategorySkills.length > 0) {
      skillCategories.push({
        name: currentCategory,
        skills: [...currentCategorySkills]
      });
      currentCategory = null;
      currentCategorySkills = [];
    }
  };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if line is formatted as "Category: Skill1, Skill2"
    const colonMatch = trimmed.match(/^([^:]{2,35}):\s*(.*)$/);

    if (colonMatch) {
      flushCategory();
      const catName = colonMatch[1].replace(/^[-–—•●▪◦⁃‣*\s]+/, '').trim();
      const skillsPart = colonMatch[2].trim();

      if (skillsPart) {
        const parsed = skillsPart
          .split(/[,•|/]/)
          .map(s => cleanBulletText(s))
          .filter(Boolean);

        if (parsed.length > 0) {
          skillCategories.push({ name: catName, skills: parsed });
          parsed.forEach(s => flatSkillsSet.add(s));
        }
      } else {
        // Category heading on its own line ending with colon
        currentCategory = catName;
      }
      return;
    }

    // Check if line itself looks like a short category name without colon
    // e.g. "Programming Languages" followed by "C++, C, Python"
    const isCategoryCandidate =
      trimmed.length < 35 &&
      !trimmed.includes(',') &&
      !trimmed.includes('•') &&
      !trimmed.includes('|') &&
      !/^[-–—•●▪◦⁃‣*]/.test(trimmed) &&
      /^[A-Za-z\s&/]+$/.test(trimmed);

    if (isCategoryCandidate && !currentCategory) {
      currentCategory = trimmed;
      return;
    }

    // If we have an active category waiting for its skills
    if (currentCategory) {
      const parsed = trimmed
        .split(/[,•|/]/)
        .map(s => cleanBulletText(s))
        .filter(Boolean);

      if (parsed.length > 0) {
        currentCategorySkills.push(...parsed);
        parsed.forEach(s => flatSkillsSet.add(s));
      }
      flushCategory();
      return;
    }

    // Otherwise, standalone skills line
    const parsed = trimmed
      .split(/[,•|/]/)
      .map(s => cleanBulletText(s))
      .filter(Boolean);

    parsed.forEach(s => flatSkillsSet.add(s));
  });

  flushCategory();

  const flatSkills = Array.from(flatSkillsSet);

  return { flatSkills, skillCategories };
};

// --- Projects Parser ---
const parseProjects = (lines) => {
  if (!lines || lines.length === 0) return [];

  const projects = [];
  let currentProject = null;

  const startNewProject = (rawTitle) => {
    if (currentProject) {
      finalizeProject(currentProject);
      projects.push(currentProject);
    }

    let name = rawTitle.trim();
    let inlineTech = [];
    let inlineLink = '';

    // 1. Extract link if embedded in project title
    const urlMatch = name.match(/https?:\/\/[^\s)]+/i) || name.match(/github\.com\/[^\s)]+/i);
    if (urlMatch) {
      inlineLink = urlMatch[0];
      name = name.replace(urlMatch[0], '').replace(/[()]/g, '').trim();
    }

    // 2. Extract technologies if separated by pipe | or dash - or colon :
    const techSplitMatch = name.match(/^(.+?)\s*(?:[|–—]|\s+-\s+|:\s+)\s*(.+)$/);
    if (techSplitMatch) {
      const potentialName = techSplitMatch[1].trim();
      const potentialTech = techSplitMatch[2].trim();
      // If second part looks like tech stack (has commas or tech keywords)
      if (potentialTech.includes(',') || /(?:react|node|python|java|sql|api|html|css|docker|aws|mongo|c\+\+|vue|angular|express|next|fastapi|django|flask)/i.test(potentialTech)) {
        name = potentialName;
        inlineTech = potentialTech.split(/[,|•]/).map(cleanBulletText).filter(Boolean);
      }
    } else {
      // Check for parentheses: Project Name (React, Node.js)
      const parenMatch = name.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (parenMatch && parenMatch[2].includes(',')) {
        name = parenMatch[1].trim();
        inlineTech = parenMatch[2].split(/[,|•]/).map(cleanBulletText).filter(Boolean);
      }
    }

    currentProject = {
      name: cleanProjectName(name),
      technologies: inlineTech,
      link: inlineLink,
      bullets: [],
      description: ''
    };
  };

  const finalizeProject = (p) => {
    if (p.bullets.length > 0 && !p.description) {
      p.description = p.bullets.join('\n');
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check for Technologies line
    const techMatch = trimmed.match(/^(?:technologies|tech\s+stack|tools|built\s+with|tech):\s*(.*)$/i);
    if (techMatch && currentProject) {
      const techList = techMatch[1]
        .split(/[,|•]/)
        .map(t => cleanBulletText(t))
        .filter(Boolean);
      currentProject.technologies.push(...techList);
      return;
    }

    // Check for Link line
    const linkMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s]+|(?:https?:\/\/[^\s]+)/i);
    if (linkMatch && currentProject && !currentProject.link) {
      currentProject.link = linkMatch[0];
      // If the line only contained the link, don't treat it as a bullet
      if (trimmed.length === linkMatch[0].length) return;
    }

    // Check if line indicates a new project start:
    // 1. Numbered project: "1. TigerPDF" or "1) TigerPDF"
    const numberedMatch = trimmed.match(/^(?:\d+[.)]|\(\d+\))\s*(.+)$/);
    if (numberedMatch) {
      startNewProject(numberedMatch[1]);
      return;
    }

    // 2. Short non-bullet line when we either don't have a project yet,
    // or previous project already has bullets/technologies
    const isBullet = /^[-–—•●▪◦⁃‣*○\u25CB]/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed);
    const startsWithLowercase = /^[a-z]/.test(trimmed);
    const startsWithConnector = /^(?:and|with|for|to|by|in|on|at|using|including|built|developed|implemented|created|designed|managed|led|worked|optimized|improved)\b/i.test(trimmed);
    const isShortTitle = trimmed.length < 60 && !isBullet && !trimmed.endsWith('.') && !startsWithLowercase && !startsWithConnector;

    if (!currentProject) {
      startNewProject(trimmed);
      return;
    }

    if (
      isShortTitle &&
      (currentProject.bullets.length > 0 || currentProject.technologies.length > 0)
    ) {
      startNewProject(trimmed);
      return;
    }

    // Bullet point or description line
    if (isBullet) {
      currentProject.bullets.push(cleanBulletText(trimmed));
    } else {
      // Continuation of previous bullet or first descriptive line
      if (currentProject.bullets.length > 0) {
        const lastIdx = currentProject.bullets.length - 1;
        currentProject.bullets[lastIdx] += ' ' + trimmed;
      } else {
        currentProject.bullets.push(trimmed);
      }
    }
  });

  if (currentProject) {
    finalizeProject(currentProject);
    projects.push(currentProject);
  }

  return projects;
};

const cleanProjectName = (rawName) => {
  return String(rawName)
    .replace(/^(?:\d+[.)]|\(\d+\))\s*/, '')
    .replace(/^project\s*\d*[:\s-]*/i, '')
    .replace(/\s*[|–—].*$/, '')
    .trim();
};

// --- Education Parser ---
const parseEducation = (lines) => {
  if (!lines || lines.length === 0) return [];

  const educationList = [];
  let currentEdu = null;

  const startNewEducation = () => {
    if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
      educationList.push(currentEdu);
    }
    currentEdu = {
      institution: '',
      degree: '',
      year: '',
      startYear: '',
      endYear: '',
      cgpa: '',
      details: ''
    };
  };

  startNewEducation();

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check for CGPA / Grade
    const cgpaMatch = trimmed.match(/(?:cgpa|gpa|score|percentage|marks)?[\s:]*([0-9.]+\s*(?:\/\s*[0-9.]+)?%?)/i);
    if (cgpaMatch && /cgpa|gpa|\/\s*10|%/i.test(trimmed)) {
      currentEdu.cgpa = cgpaMatch[1].trim();
      currentEdu.details = currentEdu.details || `CGPA: ${currentEdu.cgpa}`;
      return;
    }

    // Check for Year pattern
    const yearMatch = trimmed.match(/\b(19\d\d|20\d\d)\s*[-–—to]+\s*(19\d\d|20\d\d|present|current|expected)\b/i);
    if (yearMatch) {
      currentEdu.startYear = yearMatch[1];
      currentEdu.endYear = yearMatch[2];
      currentEdu.year = `${yearMatch[1]} – ${yearMatch[2]}`;
      return;
    }

    // Check for single graduation year
    const singleYearMatch = trimmed.match(/\b(19\d\d|20\d\d)\b/);
    if (singleYearMatch && trimmed.length < 20) {
      currentEdu.year = singleYearMatch[1];
      currentEdu.endYear = singleYearMatch[1];
      return;
    }

    // Check for Degree
    const isDegree = /(?:bachelor|b\.tech|b\.e\.|b\.sc|master|m\.tech|m\.s\.|ph\.d|diploma|associate|higher\s+secondary|high\s+school|class\s+xii|class\s+x|computer\s+science|engineering|technology)/i.test(trimmed);
    if (isDegree && !currentEdu.degree) {
      currentEdu.degree = trimmed;
      return;
    }

    // Check for Institution
    const isInstitution = /(?:university|college|institute|school|academy|group\s+of\s+institutions|campus)/i.test(trimmed);
    if (isInstitution && !currentEdu.institution) {
      currentEdu.institution = trimmed;
      return;
    }

    // If already has institution & encounters a new institution OR already has degree & encounters a new degree
    const isNewEntry = (currentEdu.institution && isInstitution) ||
      (currentEdu.degree && isDegree) ||
      (currentEdu.institution && currentEdu.degree && (isInstitution || isDegree));

    if (isNewEntry) {
      startNewEducation();
      if (isInstitution) currentEdu.institution = trimmed;
      else if (isDegree) currentEdu.degree = trimmed;
      return;
    }

    // Otherwise assign to institution if missing, then degree
    if (!currentEdu.institution) {
      currentEdu.institution = trimmed;
    } else if (!currentEdu.degree) {
      currentEdu.degree = trimmed;
    } else if (!currentEdu.details) {
      currentEdu.details = trimmed;
    }
  });

  if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
    educationList.push(currentEdu);
  }

  return educationList;
};

// --- Experience & Internships Parser ---
const parseExperience = (expLines = [], internshipLines = []) => {
  const experiences = [];

  const parseEntries = (lines, defaultRole = 'Role') => {
    let currentEntry = null;

    const startNewEntry = (title) => {
      if (currentEntry) {
        if (currentEntry.bullets.length > 0 && !currentEntry.description) {
          currentEntry.description = currentEntry.bullets.join('\n');
        }
        experiences.push(currentEntry);
      }
      currentEntry = {
        title: title || defaultRole,
        company: '',
        duration: '',
        location: '',
        description: '',
        bullets: []
      };
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isBullet = /^[-–—•●▪◦⁃‣*○\u25CB]/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed);
      const startsWithLowercase = /^[a-z]/.test(trimmed);
      const startsWithConnector = /^(?:and|with|for|to|by|in|on|at|using|including|built|developed|implemented|created|designed|managed|led|worked|optimized|improved)\b/i.test(trimmed);

      // Duration match: "Jan 2023 - Present" or "2023 - 2024"
      const durationMatch = trimmed.match(/\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}\s*[-–—to]+\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}|present|current)\b/i);

      if (durationMatch && currentEntry && !currentEntry.duration) {
        currentEntry.duration = durationMatch[0];
        const remaining = trimmed.replace(durationMatch[0], '').replace(/[()]/g, '').trim();
        if (remaining && !currentEntry.company) {
          currentEntry.company = remaining;
        }
        return;
      }

      if (!currentEntry) {
        startNewEntry(trimmed);
        return;
      }

      if (isBullet) {
        currentEntry.bullets.push(cleanBulletText(trimmed));
        return;
      }

      // Check for new job entry start
      if (
        trimmed.length < 50 &&
        currentEntry.bullets.length > 0 &&
        !trimmed.endsWith('.') &&
        !startsWithLowercase &&
        !startsWithConnector
      ) {
        startNewEntry(trimmed);
        return;
      }

      if (!currentEntry.company) {
        currentEntry.company = trimmed;
      } else if (currentEntry.bullets.length > 0) {
        const lastIdx = currentEntry.bullets.length - 1;
        currentEntry.bullets[lastIdx] += ' ' + trimmed;
      } else {
        currentEntry.bullets.push(trimmed);
      }
    });

    if (currentEntry) {
      if (currentEntry.bullets.length > 0 && !currentEntry.description) {
        currentEntry.description = currentEntry.bullets.join('\n');
      }
      experiences.push(currentEntry);
    }
  };

  parseEntries(expLines, 'Professional Role');
  parseEntries(internshipLines, 'Internship');

  return experiences;
};

// --- Certifications Parser ---
const parseCertifications = (lines) => {
  if (!lines || lines.length === 0) return [];

  const certs = [];
  let currentCert = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const isNumbered = /^(?:\d+[.)]|\(\d+\))\s*(.+)$/.test(trimmed);
    const isBullet = /^[-–—•●▪◦⁃‣*]/.test(trimmed);
    const cleaned = cleanBulletText(trimmed);

    if (isNumbered || isBullet) {
      if (currentCert) certs.push(currentCert.trim());
      currentCert = cleaned;
    } else if (currentCert) {
      // Continuation line (wrapped certificate title/provider)
      currentCert += ' ' + cleaned;
    } else {
      currentCert = cleaned;
    }
  });

  if (currentCert) {
    certs.push(currentCert.trim());
  }

  return certs.filter(Boolean);
};

// --- Achievements Parser ---
const parseAchievements = (lines) => {
  if (!lines || lines.length === 0) return [];

  const achievements = [];
  let currentAchievement = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const isNumbered = /^(?:\d+[.)]|\(\d+\))\s*(.+)$/.test(trimmed);
    const isBullet = /^[-–—•●▪◦⁃‣*]/.test(trimmed);
    const cleaned = cleanBulletText(trimmed);

    if (isNumbered || isBullet) {
      if (currentAchievement) achievements.push(currentAchievement.trim());
      currentAchievement = cleaned;
    } else if (currentAchievement) {
      currentAchievement += ' ' + cleaned;
    } else {
      currentAchievement = cleaned;
    }
  });

  if (currentAchievement) {
    achievements.push(currentAchievement.trim());
  }

  return achievements.filter(Boolean);
};

module.exports = {
  parseResume,
  normalizeRawText,
  detectSectionHeading,
  parseContactInfo,
  parseSummary,
  parseSkills,
  parseProjects,
  parseEducation,
  parseExperience,
  parseCertifications,
  parseAchievements
};
