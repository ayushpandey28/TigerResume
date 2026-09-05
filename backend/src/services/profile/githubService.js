const ProfileAnalysis = require('../../models/ProfileAnalysis');
const aiService = require('../ai/aiService');

// Helper: Normalize username from input URL or raw string
const extractUsername = (input = '') => {
  let cleaned = input.trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    try {
      const urlObj = new URL(cleaned);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length > 0) return parts[0];
    } catch (err) {
      // Fallback to simple split
    }
  }
  return cleaned.replace(/^@/, '').split('/')[0];
};

const analyzeGitHubProfile = async (input, userId) => {
  const username = extractUsername(input);
  if (!username) throw new Error('Invalid GitHub username or URL');

  let profileData, reposData;

  try {
    const headers = {
      'User-Agent': 'TigerResume-App/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (profileRes.status === 404) {
      throw new Error(`GitHub profile '${username}' not found.`);
    } else if (profileRes.status === 403) {
      throw new Error('GitHub API rate limit reached. Please try again later.');
    } else if (!profileRes.ok) {
      throw new Error('Failed to connect to GitHub API.');
    }
    profileData = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers });
    reposData = reposRes.ok ? await reposRes.json() : [];
  } catch (err) {
    if (err.message.includes('GitHub profile') || err.message.includes('rate limit')) {
      throw err;
    }
    throw new Error('Failed to connect to GitHub API. Please check the username or try again later.');
  }


  // 1. Process Languages & Metrics
  const languageCounts = {};
  let totalStars = 0;
  let totalForks = 0;
  let reposWithDescription = 0;

  const processedRepos = reposData.map(r => {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }
    if (r.description) reposWithDescription++;
    totalStars += r.stargazers_count || 0;
    totalForks += r.forks_count || 0;

    return {
      name: r.name,
      description: r.description || '',
      language: r.language || 'N/A',
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      updatedAt: r.updated_at,
      url: r.html_url
    };
  });

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  // 2. Deterministic Strengths, Gaps & Suggestions
  const strengths = [];
  const gaps = [];
  const suggestions = [];

  if (profileData.public_repos >= 5) {
    strengths.push(`Good repository count (${profileData.public_repos} public repos)`);
  }
  if (topLanguages.length > 0) {
    strengths.push(`Demonstrates active tech stack: ${topLanguages.slice(0, 4).join(', ')}`);
  }
  if (totalStars > 0) {
    strengths.push(`Earned ${totalStars} total stars across public repositories`);
  }

  if (!profileData.bio) {
    gaps.push('GitHub profile bio is missing');
    suggestions.push('Add a concise professional bio highlighting your target developer role.');
  }
  if (reposWithDescription < processedRepos.length) {
    gaps.push(`${processedRepos.length - reposWithDescription} recent repositories lack descriptions`);
    suggestions.push('Add clear 1-sentence descriptions to all public repositories.');
  }

  suggestions.push('Pin your top 2-3 portfolio projects on your GitHub profile overview.');

  // 3. Optional AI Insights
  let aiInsights = null;
  if (aiService.isAIAvailable()) {
    aiInsights = await aiService.analyzeGitHub({
      username: profileData.login,
      bio: profileData.bio,
      topLanguages,
      repos: processedRepos.slice(0, 5)
    });
  }

  const analysisPayload = {
    profileType: 'github',
    user: userId,
    profileUrl: profileData.html_url || `https://github.com/${username}`,
    username: profileData.login,
    analysis: {
      profile: {
        username: profileData.login,
        name: profileData.name || profileData.login,
        bio: profileData.bio || '',
        avatarUrl: profileData.avatar_url,
        publicRepos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        createdAt: profileData.created_at
      },
      metrics: {
        topLanguages,
        totalStars,
        totalForks,
        analyzedReposCount: processedRepos.length
      },
      repositories: processedRepos,
      strengths,
      gaps,
      suggestions,
      aiInsights: aiInsights?.available === false ? null : aiInsights
    }
  };

  // 4. Save in MongoDB
  const record = await ProfileAnalysis.create(analysisPayload);
  return record;
};

const getGitHubHistory = async (userId) => {
  return ProfileAnalysis.find({ user: userId, profileType: 'github' }).sort({ createdAt: -1 });
};

const getGitHubAnalysisById = async (id, userId) => {
  const record = await ProfileAnalysis.findOne({ _id: id, user: userId, profileType: 'github' });
  if (!record) throw new Error('GitHub profile analysis not found');
  return record;
};

module.exports = {
  analyzeGitHubProfile,
  getGitHubHistory,
  getGitHubAnalysisById
};

