export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getScoreColor = (score) => {
  if (score >= 75) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
};

export const getScoreLabel = (score) => {
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
};

export const getScoreClass = (score) => {
  if (score >= 75) return 'score-high';
  if (score >= 50) return 'score-medium';
  return 'score-low';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
