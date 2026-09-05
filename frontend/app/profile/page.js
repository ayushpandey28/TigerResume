'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../lib/api';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCode,
  FiBookOpen,
  FiLink,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiEdit2,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiAward,
  FiFileText,
  FiTarget,
  FiBarChart2,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PREFERRED_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Software Engineer',
  'Data Analyst',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Mobile Developer'
];

const EXPERIENCE_LEVELS = [
  'Entry Level (0-1 yrs)',
  'Associate (1-3 yrs)',
  'Mid Level (3-5 yrs)',
  'Senior Level (5+ yrs)'
];

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    resumesCount: 0,
    atsCount: 0,
    matchesCount: 0,
    githubCount: 0,
    linkedinCount: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    headline: '',
    summary: '',
    preferredRole: 'Full Stack Developer',
    experienceLevel: 'Entry Level (0-1 yrs)',
    skills: [],
    education: [],
    links: {
      github: '',
      linkedin: '',
      portfolio: '',
      leetcode: ''
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('tiger_resume_theme') || 'light';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {}
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('tiger_resume_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      toast.success(`${theme === 'dark' ? 'Dark' : 'Light'} theme activated`);
    } catch (e) {}
  };

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/sign-in');
    } else if (authUser) {
      loadProfileData();
    }
  }, [authLoading, authUser, router]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile();
      const userData = res.data?.user || {};
      const userStats = res.data?.stats || {};

      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        avatar: userData.avatar || '',
        headline: userData.headline || '',
        summary: userData.summary || '',
        preferredRole: userData.preferredRole || 'Full Stack Developer',
        experienceLevel: userData.experienceLevel || 'Entry Level (0-1 yrs)',
        skills: Array.isArray(userData.skills) ? userData.skills : [],
        education: Array.isArray(userData.education) ? userData.education : [],
        links: {
          github: userData.links?.github || '',
          linkedin: userData.links?.linkedin || '',
          portfolio: userData.links?.portfolio || '',
          leetcode: userData.links?.leetcode || ''
        }
      });

      setStats({
        resumesCount: userStats.resumesCount || 0,
        atsCount: userStats.atsCount || 0,
        matchesCount: userStats.matchesCount || 0,
        githubCount: userStats.githubCount || 0,
        linkedinCount: userStats.linkedinCount || 0
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await updateUserProfile(formData);
      const updated = res.data?.user;
      if (updated) {
        updateUser(updated);
      }
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfileData();
    setIsEditing(false);
  };

  // Skill Add / Remove
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      toast.error('Skill already added');
      return;
    }
    setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    setNewSkill('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Education Add / Remove / Change
  const handleAddEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { degree: '', institution: '', startYear: '', endYear: '', grade: '' }
      ]
    });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEdu = [...formData.education];
    updatedEdu[index][field] = value;
    setFormData({ ...formData, education: updatedEdu });
  };

  const handleRemoveEducation = (indexToRemove) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, idx) => idx !== indexToRemove)
    });
  };

  if (authLoading || loading) {
    return <Loader text="Loading your career profile..." />;
  }

  if (!authUser) return null;

  const initials = (formData.name || 'User')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        {/* Page Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>Career Profile</h1>
            <p>Manage your central career information, target roles, technical skills, and links</p>
          </div>
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px' }}
              >
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '14px' }}
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-outline"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '14px' }}
                >
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section A: Profile Header Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '28px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={formData.name}
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
              />
            ) : (
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 700,
                boxShadow: 'var(--shadow)'
              }}>
                {initials}
              </div>
            )}

            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                  {formData.name || 'Your Name'}
                </h2>
                {formData.preferredRole && (
                  <span className="badge badge-info" style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {formData.preferredRole}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500, margin: '6px 0 8px 0' }}>
                {formData.headline || 'No professional headline set'}
              </p>

              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-light)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiMail /> {formData.email}
                </span>
                {formData.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiPhone /> {formData.phone}
                  </span>
                )}
                {formData.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiMapPin /> {formData.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section G: Profile Statistics Grid */}
        <div className="grid-4" style={{ gap: '16px', marginBottom: '28px' }}>
          <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(249,115,22,0.1)', borderRadius: '8px', color: 'var(--primary)', fontSize: '20px' }}>
              <FiFileText />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{stats.resumesCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>Resumes Created</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', color: '#3B82F6', fontSize: '20px' }}>
              <FiTarget />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{stats.atsCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>ATS Analyses</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10B981', fontSize: '20px' }}>
              <FiBarChart2 />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{stats.matchesCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>Job Matches</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', color: '#8B5CF6', fontSize: '20px' }}>
              <FiAward />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{stats.githubCount + stats.linkedinCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>Profile Audits</div>
            </div>
          </div>
        </div>

        {/* Section: Appearance & Interface Theme */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentTheme === 'dark' ? <FiMoon style={{ color: 'var(--primary)' }} /> : <FiSun style={{ color: 'var(--primary)' }} />} Interface Theme
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
                Choose your preferred interface appearance. The selected theme will persist across sessions.
              </p>
            </div>

            {/* Toggle Controls */}
            <div style={{ display: 'flex', background: 'var(--bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', gap: '4px' }}>
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: currentTheme === 'light' ? 'var(--bg-card)' : 'transparent',
                  color: currentTheme === 'light' ? 'var(--primary)' : 'var(--text-light)',
                  boxShadow: currentTheme === 'light' ? 'var(--shadow)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiSun style={{ fontSize: '15px' }} /> Light
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: currentTheme === 'dark' ? 'var(--bg-card)' : 'transparent',
                  color: currentTheme === 'dark' ? 'var(--primary)' : 'var(--text-light)',
                  boxShadow: currentTheme === 'dark' ? 'var(--shadow)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiMoon style={{ fontSize: '15px' }} /> Dark
              </button>
            </div>
          </div>
        </div>

        {/* Edit / View Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section B: Personal Information */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser style={{ color: 'var(--primary)' }} /> Personal Information
            </h3>

            {!isEditing ? (
              <div className="grid-2" style={{ gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>Full Name</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{formData.name || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>Email Address</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{formData.email || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>Phone Number</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{formData.phone || 'Not provided'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>Location</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{formData.location || 'Not provided'}</div>
                </div>
              </div>
            ) : (
              <div className="grid-2" style={{ gap: '16px' }}>
                <div>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Email Address (Read Only)</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    style={{ background: 'var(--bg)', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="New Delhi, India"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Avatar / Profile Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section C: Professional Information */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBriefcase style={{ color: 'var(--primary)' }} /> Professional Overview
            </h3>

            {!isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid-2" style={{ gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>Professional Headline</label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{formData.headline || 'Not specified'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>Preferred Job Role</label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>{formData.preferredRole || 'Not specified'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>Experience Level</label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{formData.experienceLevel || 'Not specified'}</div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Career Summary</label>
                  <div style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: '1.6', background: 'var(--bg)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    {formData.summary || 'No career summary provided yet.'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label>Professional Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer | React & Node.js"
                    value={formData.headline}
                    onChange={e => setFormData({ ...formData, headline: e.target.value })}
                  />
                </div>

                <div className="grid-2" style={{ gap: '16px' }}>
                  <div>
                    <label>Preferred Job Role</label>
                    <select
                      value={formData.preferredRole}
                      onChange={e => setFormData({ ...formData, preferredRole: e.target.value })}
                    >
                      {PREFERRED_ROLES.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
                    >
                      {EXPERIENCE_LEVELS.map((lvl, i) => (
                        <option key={i} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label>Career Summary</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe your career background, target technical domain, and key achievements..."
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section D: Technical Skills */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCode style={{ color: 'var(--primary)' }} /> Technical Skills ({formData.skills.length})
            </h3>

            {isEditing && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Add a new skill (e.g. TypeScript, Docker, AWS)"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FiPlus /> Add
                </button>
              </div>
            )}

            {formData.skills.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>No skills added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="badge"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '13px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {skill}
                    {isEditing && (
                      <FiX
                        onClick={() => handleRemoveSkill(idx)}
                        style={{ cursor: 'pointer', color: 'var(--danger)', fontSize: '14px' }}
                      />
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section E: Education */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBookOpen style={{ color: 'var(--primary)' }} /> Education Background
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="btn btn-outline"
                  style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FiPlus /> Add Education
                </button>
              )}
            </div>

            {!isEditing ? (
              formData.education.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>No education details added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.education.map((edu, i) => (
                    <div key={i} style={{ padding: '14px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                          {edu.degree || 'Degree'}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--primary)', margin: '4px 0 2px 0', fontWeight: 500 }}>
                        {edu.institution || 'Institution'}
                      </div>
                      {edu.grade && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Grade / CGPA: {edu.grade}</div>}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formData.education.map((edu, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>Education #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(i)}
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--border)' }}
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>

                    <div className="grid-2" style={{ gap: '12px' }}>
                      <div>
                        <label>Degree / Program *</label>
                        <input
                          type="text"
                          placeholder="e.g. B.Tech in Computer Science"
                          value={edu.degree}
                          onChange={e => handleEducationChange(i, 'degree', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Institution / University *</label>
                        <input
                          type="text"
                          placeholder="e.g. Delhi Technological University"
                          value={edu.institution}
                          onChange={e => handleEducationChange(i, 'institution', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Start Year</label>
                        <input
                          type="text"
                          placeholder="2019"
                          value={edu.startYear}
                          onChange={e => handleEducationChange(i, 'startYear', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>End Year (or Present)</label>
                        <input
                          type="text"
                          placeholder="2023"
                          value={edu.endYear}
                          onChange={e => handleEducationChange(i, 'endYear', e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label>Grade / CGPA (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 8.5 CGPA / First Class"
                          value={edu.grade}
                          onChange={e => handleEducationChange(i, 'grade', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section F: Professional Links */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLink style={{ color: 'var(--primary)' }} /> Professional Links
            </h3>

            {!isEditing ? (
              <div className="grid-2" style={{ gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiGithub style={{ fontSize: '18px', color: 'var(--text)' }} />
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>GitHub</label>
                    {formData.links.github ? (
                      <a href={formData.links.github.startsWith('http') ? formData.links.github : `https://${formData.links.github}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                        {formData.links.github} ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not added</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiLinkedin style={{ fontSize: '18px', color: '#0A66C2' }} />
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>LinkedIn</label>
                    {formData.links.linkedin ? (
                      <a href={formData.links.linkedin.startsWith('http') ? formData.links.linkedin : `https://${formData.links.linkedin}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: '#0A66C2' }}>
                        {formData.links.linkedin} ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not added</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiGlobe style={{ fontSize: '18px', color: '#059669' }} />
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>Portfolio</label>
                    {formData.links.portfolio ? (
                      <a href={formData.links.portfolio.startsWith('http') ? formData.links.portfolio : `https://${formData.links.portfolio}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                        {formData.links.portfolio} ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not added</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCode style={{ fontSize: '18px', color: '#EA580C' }} />
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>LeetCode / Coding Profile</label>
                    {formData.links.leetcode ? (
                      <a href={formData.links.leetcode.startsWith('http') ? formData.links.leetcode : `https://${formData.links.leetcode}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: '#EA580C' }}>
                        {formData.links.leetcode} ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not added</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid-2" style={{ gap: '16px' }}>
                <div>
                  <label>GitHub Profile URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/username"
                    value={formData.links.github}
                    onChange={e => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                  />
                </div>
                <div>
                  <label>LinkedIn Profile URL</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.links.linkedin}
                    onChange={e => setFormData({ ...formData, links: { ...formData.links, linkedin: e.target.value } })}
                  />
                </div>
                <div>
                  <label>Portfolio Website URL</label>
                  <input
                    type="text"
                    placeholder="https://yourportfolio.com"
                    value={formData.links.portfolio}
                    onChange={e => setFormData({ ...formData, links: { ...formData.links, portfolio: e.target.value } })}
                  />
                </div>
                <div>
                  <label>LeetCode Profile URL</label>
                  <input
                    type="text"
                    placeholder="https://leetcode.com/username"
                    value={formData.links.leetcode}
                    onChange={e => setFormData({ ...formData, links: { ...formData.links, leetcode: e.target.value } })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
