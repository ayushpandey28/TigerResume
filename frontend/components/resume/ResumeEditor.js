'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export default function ResumeEditor({ resume, onSave, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: resume?.title || '',
    contact: {
      name: resume?.contact?.name || '',
      email: resume?.contact?.email || '',
      phone: resume?.contact?.phone || '',
      location: resume?.contact?.location || '',
      linkedin: resume?.contact?.linkedin || '',
      github: resume?.contact?.github || ''
    },
    summary: resume?.summary || '',
    skillsStr: (resume?.skills || []).join(', '),
    experienceStr: JSON.stringify(resume?.experience || [], null, 2),
    educationStr: JSON.stringify(resume?.education || [], null, 2),
    projectsStr: JSON.stringify(resume?.projects || [], null, 2),
    certificationsStr: (resume?.certifications || []).join(', ')
  });

  const [saving, setSaving] = useState(false);

  const handleImportProfile = () => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      contact: {
        name: user.name || prev.contact.name,
        email: user.email || prev.contact.email,
        phone: user.phone || prev.contact.phone,
        location: user.location || prev.contact.location,
        linkedin: user.links?.linkedin || prev.contact.linkedin,
        github: user.links?.github || prev.contact.github
      },
      summary: user.summary || prev.summary,
      skillsStr: user.skills && user.skills.length > 0 ? user.skills.join(', ') : prev.skillsStr
    }));
    toast.success('Imported career profile information!');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const skills = formData.skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      const certifications = formData.certificationsStr.split(',').map(c => c.trim()).filter(Boolean);

      let experience = [];
      let education = [];
      let projects = [];

      try {
        if (formData.experienceStr.trim()) experience = JSON.parse(formData.experienceStr);
        if (formData.educationStr.trim()) education = JSON.parse(formData.educationStr);
        if (formData.projectsStr.trim()) projects = JSON.parse(formData.projectsStr);
      } catch (jsonErr) {
        toast.error('JSON format error in Experience, Education, or Projects');
        setSaving(false);
        return;
      }

      const updatedPayload = {
        title: formData.title,
        contact: formData.contact,
        summary: formData.summary,
        skills,
        experience,
        education,
        projects,
        certifications
      };

      await onSave(resume._id, updatedPayload);
      toast.success('Resume updated successfully! (New version created)');
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Edit Resume</h2>
        <span className="badge badge-warning">Version {resume?.currentVersion || 1} → Version {(resume?.currentVersion || 1) + 1}</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label>Resume Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            required
          />
        </div>

        {/* Contact Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary)', margin: 0 }}>Contact Details</h3>
          <button
            type="button"
            onClick={handleImportProfile}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '4px 12px' }}
          >
            👤 Import Profile Data
          </button>
        </div>

        <div className="grid-2" style={{ marginBottom: '20px' }}>
          <div>
            <label>Name</label>
            <input type="text" value={formData.contact.name} onChange={e => handleContactChange('name', e.target.value)} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={formData.contact.email} onChange={e => handleContactChange('email', e.target.value)} />
          </div>
          <div>
            <label>Phone</label>
            <input type="text" value={formData.contact.phone} onChange={e => handleContactChange('phone', e.target.value)} />
          </div>
          <div>
            <label>Location</label>
            <input type="text" value={formData.contact.location} onChange={e => handleContactChange('location', e.target.value)} />
          </div>
          <div>
            <label>LinkedIn URL</label>
            <input type="text" value={formData.contact.linkedin} onChange={e => handleContactChange('linkedin', e.target.value)} />
          </div>
          <div>
            <label>GitHub URL</label>
            <input type="text" value={formData.contact.github} onChange={e => handleContactChange('github', e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: '20px' }}>
          <label>Professional Summary</label>
          <textarea
            rows={4}
            value={formData.summary}
            onChange={e => handleChange('summary', e.target.value)}
          />
        </div>

        {/* Skills */}
        <div style={{ marginBottom: '20px' }}>
          <label>Skills (Comma-separated)</label>
          <input
            type="text"
            value={formData.skillsStr}
            onChange={e => handleChange('skillsStr', e.target.value)}
            placeholder="JavaScript, React, Node.js, MongoDB"
          />
        </div>

        {/* Experience */}
        <div style={{ marginBottom: '20px' }}>
          <label>Work Experience (JSON Array)</label>
          <textarea
            rows={6}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
            value={formData.experienceStr}
            onChange={e => handleChange('experienceStr', e.target.value)}
          />
        </div>

        {/* Education */}
        <div style={{ marginBottom: '20px' }}>
          <label>Education (JSON Array)</label>
          <textarea
            rows={4}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
            value={formData.educationStr}
            onChange={e => handleChange('educationStr', e.target.value)}
          />
        </div>

        {/* Projects */}
        <div style={{ marginBottom: '20px' }}>
          <label>Projects (JSON Array)</label>
          <textarea
            rows={4}
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
            value={formData.projectsStr}
            onChange={e => handleChange('projectsStr', e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-outline">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving & Creating Version...' : 'Save Resume'}
          </button>
        </div>
      </form>
    </div>
  );
}

