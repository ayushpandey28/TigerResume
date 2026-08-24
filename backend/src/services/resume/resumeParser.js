const parseResume = async (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return createEmptyStructuredData();
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const contact = extractContactInfo(rawText, lines);
  const skills = extractSkills(rawText);
  const sections = parseSections(rawText);

  return {
    contact,
    summary: sections.summary || '',
    skills,
    education: sections.education || [],
    experience: sections.experience || [],
    projects: sections.projects || [],
    certifications: sections.certifications || []
  };
};

const createEmptyStructuredData = () => ({
  contact: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
  summary: '',
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: []
});

const extractContactInfo = (text, lines) => {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/i);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);

  // First line is often the candidate's name if short and doesn't contain email/phone
  let candidateName = '';
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes('@') && !/\d{5,}/.test(firstLine)) {
      candidateName = firstLine;
    }
  }

  return {
    name: candidateName,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    location: '',
    linkedin: linkedinMatch ? linkedinMatch[0] : '',
    github: githubMatch ? githubMatch[0] : ''
  };
};

const extractSkills = (text) => {
  const commonTechSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular', 'Node.js',
    'Express.js', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind', 'Bootstrap', 'Sass',
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'GraphQL', 'REST API',
    'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux',
    'CI/CD', 'Jest', 'Webpack', 'Babel', 'Redux', 'Mongoose'
  ];

  const matchedSkills = new Set();

  commonTechSkills.forEach(skill => {
    const escapedSkill = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\W)${escapedSkill}(?:$|\\W)`, 'i');
    if (regex.test(text)) {
      matchedSkills.add(skill);
    }
  });

  return Array.from(matchedSkills);
};


const parseSections = (text) => {
  const sections = {
    summary: '',
    education: [],
    experience: [],
    projects: [],
    certifications: []
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let currentSection = null;
  const sectionContent = {};

  const sectionHeaders = {
    summary: /^(summary|profile|about me|objective)/i,
    education: /^(education|academic background|qualification)/i,
    experience: /^(experience|work experience|employment history|work history)/i,
    projects: /^(projects|personal projects|key projects)/i,
    certifications: /^(certifications|licenses|certificates)/i
  };

  lines.forEach(line => {
    let matchedKey = null;
    for (const [key, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
      sectionContent[currentSection] = sectionContent[currentSection] || [];
    } else if (currentSection) {
      sectionContent[currentSection].push(line);
    }
  });

  if (sectionContent.summary) {
    sections.summary = sectionContent.summary.join(' ');
  }

  if (sectionContent.education) {
    sections.education = [{
      degree: '',
      institution: '',
      year: '',
      details: sectionContent.education.join(' ')
    }];
  }

  if (sectionContent.experience) {
    sections.experience = [{
      title: '',
      company: '',
      duration: '',
      location: '',
      description: sectionContent.experience.join('\n')
    }];
  }

  if (sectionContent.projects) {
    sections.projects = [{
      name: '',
      description: sectionContent.projects.join(' '),
      technologies: []
    }];
  }

  if (sectionContent.certifications) {
    sections.certifications = sectionContent.certifications;
  }

  return sections;
};

module.exports = { parseResume };

