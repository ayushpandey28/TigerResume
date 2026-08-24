// Weights configuration for Resume + JD Mode (Total 100 points)
const MODE_JD_WEIGHTS = {
  keywordMatch: 25,
  skillsMatch: 25,
  structure: 15,
  formatting: 15,
  contact: 10,
  sections: 10
};

// Weights configuration for Resume-only Mode (Total 100 points)
const MODE_RESUME_ONLY_WEIGHTS = {
  keywordMatch: 0,
  skillsMatch: 20, // Evaluates skill list completeness/richness
  structure: 25,
  formatting: 25,
  contact: 15,
  sections: 15
};

const calculateScore = ({
  hasJobDescription = false,
  keywordRatio = 1.0,
  skillsRatio = 1.0,
  structureScore = 1.0,
  formattingScore = 1.0,
  contactScore = 1.0,
  sectionsScore = 1.0
}) => {
  const weights = hasJobDescription ? MODE_JD_WEIGHTS : MODE_RESUME_ONLY_WEIGHTS;

  const keywordPoints = Math.round((weights.keywordMatch * Math.min(Math.max(keywordRatio, 0), 1)));
  const skillsPoints = Math.round((weights.skillsMatch * Math.min(Math.max(skillsRatio, 0), 1)));
  const structurePoints = Math.round((weights.structure * Math.min(Math.max(structureScore, 0), 1)));
  const formattingPoints = Math.round((weights.formatting * Math.min(Math.max(formattingScore, 0), 1)));
  const contactPoints = Math.round((weights.contact * Math.min(Math.max(contactScore, 0), 1)));
  const sectionsPoints = Math.round((weights.sections * Math.min(Math.max(sectionsScore, 0), 1)));

  const overallScore = Math.min(
    100,
    Math.max(0, keywordPoints + skillsPoints + structurePoints + formattingPoints + contactPoints + sectionsPoints)
  );

  return {
    overallScore,
    breakdown: {
      keywordMatch: keywordPoints,
      skillsMatch: skillsPoints,
      structure: structurePoints,
      formatting: formattingPoints,
      contact: contactPoints,
      sections: sectionsPoints
    },
    maxWeights: weights
  };
};

module.exports = {
  calculateScore,
  MODE_JD_WEIGHTS,
  MODE_RESUME_ONLY_WEIGHTS
};

