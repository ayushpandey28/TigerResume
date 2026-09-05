/**
 * TigerResume - Universal Resume Normalizer (Frontend ES Module)
 * Standardizes raw/legacy/parsed resume data into a predictable, robust structure
 * for backward compatibility and clean template rendering.
 */

export const normalizeResumeData = (data = {}) => {
  if (!data || typeof data !== 'object') {
    data = {};
  }

  // 1. Contact Information
  const rawContact = data.contact || {};
  const defaultNameFromTitle = data.title && !/^untitled/i.test(data.title) ? data.title.replace(/'s Resume$/i, '') : '';
  const contact = {
    name: cleanString(rawContact.name || defaultNameFromTitle || ''),
    email: cleanString(rawContact.email || ''),
    phone: cleanString(rawContact.phone || ''),
    location: cleanString(rawContact.location || ''),
    linkedin: cleanString(rawContact.linkedin || ''),
    github: cleanString(rawContact.github || ''),
    website: cleanString(rawContact.website || rawContact.portfolio || '')
  };

  // 2. Summary
  const summary = cleanString(data.summary || '');

  // 3. Skills & Categories
  const { flatSkills, skillCategories } = normalizeSkills(data.skills, data.skillCategories);

  // 4. Projects
  const projects = normalizeProjects(data.projects);

  // 5. Education
  const education = normalizeEducation(data.education);

  // 6. Experience
  const experience = normalizeExperience(data.experience);

  // 7. Certifications
  const certifications = normalizeCertifications(data.certifications);

  // 8. Achievements
  const achievements = normalizeAchievements(data.achievements);

  return {
    _id: data._id,
    user: data.user,
    title: cleanString(data.title || (contact.name ? `${contact.name}'s Resume` : 'Untitled Resume')),
    originalFileName: data.originalFileName || '',
    fileUrl: data.fileUrl || '',
    filePublicId: data.filePublicId || '',
    fileType: data.fileType || 'application/pdf',
    fileSize: data.fileSize || 0,
    extractedText: data.extractedText || '',
    currentVersion: data.currentVersion || 1,
    contact,
    summary,
    skills: flatSkills,
    skillCategories,
    education,
    experience,
    projects,
    certifications,
    achievements,
    customSections: Array.isArray(data.customSections) ? data.customSections : [],
    documentModel: data.documentModel || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

const cleanString = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
};

const normalizeSkills = (rawSkills, rawCategories) => {
  const skillCategories = [];
  const flatSkillsSet = new Set();

  // If skillCategories array already exists
  if (Array.isArray(rawCategories) && rawCategories.length > 0) {
    rawCategories.forEach(cat => {
      if (!cat) return;
      const name = cleanString(cat.name || cat.category || 'General');
      const items = (Array.isArray(cat.skills || cat.items) ? (cat.skills || cat.items) : [])
        .map(cleanString)
        .filter(Boolean);

      if (items.length > 0) {
        skillCategories.push({ name, skills: items });
        items.forEach(item => flatSkillsSet.add(item));
      }
    });
  }

  // If rawSkills is an object with categories: { frontend: [...], backend: [...] }
  if (rawSkills && typeof rawSkills === 'object' && !Array.isArray(rawSkills)) {
    Object.entries(rawSkills).forEach(([catKey, val]) => {
      const formattedCategoryName = catKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      const items = (Array.isArray(val) ? val : [val])
        .map(cleanString)
        .filter(Boolean);

      if (items.length > 0) {
        skillCategories.push({ name: formattedCategoryName, skills: items });
        items.forEach(item => flatSkillsSet.add(item));
      }
    });
  } else if (Array.isArray(rawSkills)) {
    // Array of strings - check if strings contain category headers like "Category: Skill1, Skill2"
    rawSkills.forEach(item => {
      if (!item) return;
      const str = cleanString(item);
      const colonIndex = str.indexOf(':');

      if (colonIndex > 0 && colonIndex < 40 && !str.includes('http')) {
        const catName = cleanString(str.slice(0, colonIndex));
        const skillsPart = str.slice(colonIndex + 1);
        const parsedItems = skillsPart
          .split(/[,•|/]/)
          .map(cleanString)
          .filter(Boolean);

        if (parsedItems.length > 0) {
          skillCategories.push({ name: catName, skills: parsedItems });
          parsedItems.forEach(s => flatSkillsSet.add(s));
          return;
        }
      }

      // Standalone skill
      flatSkillsSet.add(str);
    });
  }

  const flatSkills = Array.from(flatSkillsSet);

  return { flatSkills, skillCategories };
};

const normalizeProjects = (rawProjects) => {
  if (!rawProjects) return [];
  const list = Array.isArray(rawProjects) ? rawProjects : [rawProjects];

  return list
    .filter(Boolean)
    .map(p => {
      if (typeof p === 'string') {
        return {
          name: cleanString(p),
          description: '',
          technologies: [],
          link: '',
          bullets: []
        };
      }

      const name = cleanString(p.name || 'Untitled Project');

      // Normalize technologies
      let technologies = [];
      if (Array.isArray(p.technologies)) {
        technologies = p.technologies.map(cleanString).filter(Boolean);
      } else if (typeof p.technologies === 'string' && p.technologies.trim()) {
        technologies = p.technologies
          .replace(/^(technologies|tech stack|tools):\s*/i, '')
          .split(/[,|•]/)
          .map(cleanString)
          .filter(Boolean);
      }

      // Normalize bullets and description
      let bullets = [];
      if (Array.isArray(p.bullets) && p.bullets.length > 0) {
        bullets = p.bullets.map(b => cleanBulletText(b)).filter(Boolean);
      } else if (p.description) {
        bullets = extractBulletsFromText(p.description);
      }

      let description = cleanString(p.description || '');
      if (!description && bullets.length > 0) {
        description = bullets.join('\n');
      }

      return {
        name,
        technologies,
        link: cleanString(p.link || p.url || ''),
        description,
        bullets
      };
    })
    .filter(p => p.name || p.description || (p.bullets && p.bullets.length > 0));
};

const normalizeEducation = (rawEducation) => {
  if (!rawEducation) return [];
  const list = Array.isArray(rawEducation) ? rawEducation : [rawEducation];

  return list
    .filter(Boolean)
    .map(edu => {
      if (typeof edu === 'string') {
        return {
          institution: cleanString(edu),
          degree: '',
          year: '',
          startYear: '',
          endYear: '',
          cgpa: '',
          details: cleanString(edu)
        };
      }

      let institution = cleanString(edu.institution || '');
      let degree = cleanString(edu.degree || '');
      let year = cleanString(edu.year || '');
      let startYear = cleanString(edu.startYear || '');
      let endYear = cleanString(edu.endYear || '');
      let cgpa = cleanString(edu.cgpa || '');
      let details = cleanString(edu.details || '');

      // Parse years from year string if start/end are missing
      if (year && (!startYear || !endYear)) {
        const yearMatch = year.match(/\b(19\d\d|20\d\d)\s*[-–—to]+\s*(19\d\d|20\d\d|present|current|expected)\b/i);
        if (yearMatch) {
          startYear = startYear || yearMatch[1];
          endYear = endYear || yearMatch[2];
        }
      } else if (startYear && endYear && !year) {
        year = `${startYear} – ${endYear}`;
      }

      // Extract CGPA from details if cgpa is missing
      if (!cgpa && details) {
        const cgpaMatch = details.match(/(?:cgpa|gpa|score|percentage|marks)[\s:]*([0-9.]+(?:\s*\/\s*[0-9.]+)?%?)/i)
          || details.match(/\b([0-9.]+)\s*\/\s*(?:10|4\.0|100)\b/i);
        if (cgpaMatch) {
          cgpa = cgpaMatch[1].trim();
        }
      }

      // Set details default if missing
      if (!details) {
        if (cgpa) details = `CGPA: ${cgpa}`;
        else if (degree) details = degree;
      }

      return {
        institution,
        degree,
        year,
        startYear,
        endYear,
        cgpa,
        details
      };
    });
};

const normalizeExperience = (rawExperience) => {
  if (!rawExperience) return [];
  const list = Array.isArray(rawExperience) ? rawExperience : [rawExperience];

  return list
    .filter(Boolean)
    .map(exp => {
      if (typeof exp === 'string') {
        return {
          title: cleanString(exp),
          company: '',
          duration: '',
          location: '',
          description: cleanString(exp),
          bullets: extractBulletsFromText(exp)
        };
      }

      let bullets = [];
      if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
        bullets = exp.bullets.map(b => cleanBulletText(b)).filter(Boolean);
      } else if (exp.description) {
        bullets = extractBulletsFromText(exp.description);
      }

      let description = cleanString(exp.description || '');
      if (!description && bullets.length > 0) {
        description = bullets.join('\n');
      }

      return {
        title: cleanString(exp.title || 'Role'),
        company: cleanString(exp.company || ''),
        duration: cleanString(exp.duration || ''),
        location: cleanString(exp.location || ''),
        description,
        bullets
      };
    });
};

const normalizeCertifications = (rawCerts) => {
  if (!rawCerts) return [];

  let items = [];
  if (Array.isArray(rawCerts)) {
    items = rawCerts;
  } else if (typeof rawCerts === 'string') {
    items = rawCerts.split('\n');
  }

  return items
    .map(c => cleanBulletText(cleanString(c)))
    .filter(Boolean);
};

export const cleanBulletText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/^[-–—•●▪◦⁃‣*\d.)\s]+/, '')
    .trim();
};

export const extractBulletsFromText = (text) => {
  if (!text) return [];
  const lines = String(text)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const bullets = [];
  let currentBullet = '';

  lines.forEach(line => {
    const isBullet = /^[-–—•●▪◦⁃‣*]|\b\d+[.)]/.test(line);
    const cleaned = cleanBulletText(line);

    if (isBullet) {
      if (currentBullet) bullets.push(currentBullet.trim());
      currentBullet = cleaned;
    } else if (currentBullet) {
      currentBullet += ' ' + cleaned;
    } else {
      currentBullet = cleaned;
    }
  });

  if (currentBullet) {
    bullets.push(currentBullet.trim());
  }

  return bullets.filter(Boolean);
};

export const normalizeAchievements = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(cleanString).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split('\n')
      .map(s => s.replace(/^[-–—•●▪◦⁃‣*]|\b\d+[.)]/, '').trim())
      .filter(Boolean);
  }
  return [];
};
