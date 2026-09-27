const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return error(res, 'User already exists with this email', 400);
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password
    });

    const token = generateToken(user._id);

    return success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    return success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }, 'Logged in successfully', 200);
  } catch (err) {
    next(err);
  }
};

const Resume = require('../models/Resume');
const ATSResult = require('../models/ATSResult');
const JobMatch = require('../models/JobMatch');
const ProfileAnalysis = require('../models/ProfileAnalysis');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return error(res, 'User not found', 404);
    }

    const [resumesCount, atsCount, matchesCount, githubCount, linkedinCount] = await Promise.all([
      Resume.countDocuments({ user: req.user._id }),
      ATSResult.countDocuments({ user: req.user._id }),
      JobMatch.countDocuments({ user: req.user._id }),
      ProfileAnalysis.countDocuments({ user: req.user._id, profileType: 'github' }),
      ProfileAnalysis.countDocuments({ user: req.user._id, profileType: 'linkedin' })
    ]);

    const stats = {
      resumesCount,
      atsCount,
      matchesCount,
      githubCount,
      linkedinCount
    };

    return success(res, {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        avatar: user.avatar || '',
        headline: user.headline || '',
        summary: user.summary || '',
        preferredRole: user.preferredRole || '',
        experienceLevel: user.experienceLevel || '',
        skills: user.skills || [],
        education: user.education || [],
        links: user.links || { github: '', linkedin: '', portfolio: '', leetcode: '' },
        createdAt: user.createdAt
      },
      stats
    }, 'Profile retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      location,
      avatar,
      headline,
      summary,
      preferredRole,
      experienceLevel,
      skills,
      education,
      links
    } = req.body;

    if (name !== undefined && (!name || !name.trim())) {
      return error(res, 'Name cannot be empty', 400);
    }

    const updateData = {};
    ['name', 'phone', 'location', 'avatar', 'headline', 'summary', 'preferredRole', 'experienceLevel'].forEach(f => {
      if (req.body[f] !== undefined) {
        updateData[f] = req.body[f] === null ? '' : String(req.body[f]).trim();
      }
    });
    if (skills !== undefined && Array.isArray(skills)) {
      updateData.skills = skills.map(s => String(s || '').trim()).filter(Boolean);
    }
    if (education !== undefined && Array.isArray(education)) {
      updateData.education = education.filter(Boolean).map(e => ({
        degree: String(e?.degree || '').trim(),
        institution: String(e?.institution || '').trim(),
        startYear: String(e?.startYear || '').trim(),
        endYear: String(e?.endYear || '').trim(),
        grade: String(e?.grade || '').trim()
      }));
    }
    if (links !== undefined && links !== null && typeof links === 'object') {
      updateData.links = {
        github: String(links.github || '').trim(),
        linkedin: String(links.linkedin || '').trim(),
        portfolio: String(links.portfolio || '').trim(),
        leetcode: String(links.leetcode || '').trim()
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    return success(res, {
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        location: updatedUser.location || '',
        avatar: updatedUser.avatar || '',
        headline: updatedUser.headline || '',
        summary: updatedUser.summary || '',
        preferredRole: updatedUser.preferredRole || '',
        experienceLevel: updatedUser.experienceLevel || '',
        skills: updatedUser.skills || [],
        education: updatedUser.education || [],
        links: updatedUser.links || { github: '', linkedin: '', portfolio: '', leetcode: '' },
        createdAt: updatedUser.createdAt
      }
    }, 'Profile updated successfully', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getProfile, updateProfile };
