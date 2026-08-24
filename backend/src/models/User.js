const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  avatar: { type: String, trim: true, default: '' },
  headline: { type: String, trim: true, default: '' },
  summary: { type: String, trim: true, default: '' },
  preferredRole: { type: String, trim: true, default: '' },
  experienceLevel: { type: String, trim: true, default: '' },
  skills: [{ type: String, trim: true }],
  education: [{
    degree: { type: String, trim: true },
    institution: { type: String, trim: true },
    startYear: { type: String, trim: true },
    endYear: { type: String, trim: true },
    grade: { type: String, trim: true }
  }],
  links: {
    github: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' },
    leetcode: { type: String, trim: true, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

