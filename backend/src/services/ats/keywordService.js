const stopWords = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
  'does', 'doing', 'done', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'will', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'using', 'used', 'ability', 'required', 'experience', 'working', 'responsibilities'
]);

// Normalize single skill/keyword string for comparison (e.g. 'Node.js' -> 'nodejs')
const normalizeKeyword = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9#+]/g, '');
};

// Extract unique, meaningful keywords from raw text
const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];

  // Split into tokens
  const words = text
    .toLowerCase()
    .replace(/[^\w\s#+-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2 && !stopWords.has(w));

  const unique = new Set(words);
  return Array.from(unique);
};

// Match resume keywords against target job description text / keywords
const compareKeywords = (resumeKeywords, jobKeywords) => {
  if (!jobKeywords || jobKeywords.length === 0) {
    return { matched: [], missing: [], ratio: 1.0 };
  }

  const normalizedResumeSet = new Set(
    resumeKeywords.map(k => normalizeKeyword(k))
  );

  const matched = [];
  const missing = [];

  jobKeywords.forEach(jobKey => {
    const normJobKey = normalizeKeyword(jobKey);
    if (!normJobKey) return;

    if (normalizedResumeSet.has(normJobKey) || Array.from(normalizedResumeSet).some(rk => rk.includes(normJobKey) || normJobKey.includes(rk))) {
      matched.push(jobKey);
    } else {
      missing.push(jobKey);
    }
  });

  const ratio = jobKeywords.length > 0 ? matched.length / jobKeywords.length : 1.0;

  return { matched, missing, ratio };
};

// Compare skill arrays with normalization
const compareSkills = (resumeSkills = [], jobSkills = []) => {
  if (!jobSkills || jobSkills.length === 0) {
    return { matched: resumeSkills, missing: [], ratio: 1.0 };
  }

  const normalizedResumeSkills = new Set(
    resumeSkills.map(s => normalizeKeyword(s))
  );

  const matched = [];
  const missing = [];

  jobSkills.forEach(skill => {
    const normSkill = normalizeKeyword(skill);
    if (!normSkill) return;

    if (normalizedResumeSkills.has(normSkill)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const ratio = jobSkills.length > 0 ? matched.length / jobSkills.length : 1.0;

  return { matched, missing, ratio };
};

module.exports = {
  normalizeKeyword,
  extractKeywords,
  compareKeywords,
  compareSkills
};

