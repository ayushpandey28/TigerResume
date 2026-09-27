'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { normalizeResumeData } from '../../lib/resumeNormalizer';
import {
  FiPlus,
  FiTrash2,
  FiUser,
  FiBriefcase,
  FiBookOpen,
  FiFolder,
  FiCode,
  FiSave,
  FiX,
  FiSliders
} from 'react-icons/fi';

export default function ResumeEditor({ resume, onSave, onCancel }) {
  const { user } = useAuth();

  // Mode: 'forms' (default structured inputs) or 'json' (advanced raw mode)
  const [editorMode, setEditorMode] = useState('forms');

  // Contact info
  const [title, setTitle] = useState(resume?.title || '');
  const [contact, setContact] = useState({
    name: resume?.contact?.name || '',
    email: resume?.contact?.email || '',
    phone: resume?.contact?.phone || '',
    location: resume?.contact?.location || '',
    linkedin: resume?.contact?.linkedin || '',
    github: resume?.contact?.github || '',
    website: resume?.contact?.website || ''
  });

  // Summary & Skills
  const [summary, setSummary] = useState(resume?.summary || '');
  const [skillsStr, setSkillsStr] = useState((resume?.skills || []).join(', '));
  const [certificationsStr, setCertificationsStr] = useState((resume?.certifications || []).join(', '));

  // Structured Experience
  const [experience, setExperience] = useState(
    Array.isArray(resume?.experience) && resume.experience.length > 0
      ? resume.experience.map(exp => ({
          title: exp.title || '',
          company: exp.company || '',
          location: exp.location || '',
          duration: exp.duration || '',
          description: exp.description || (Array.isArray(exp.bullets) ? exp.bullets.join('\n') : '')
        }))
      : [{ title: '', company: '', location: '', duration: '', description: '' }]
  );

  // Structured Education
  const [education, setEducation] = useState(
    Array.isArray(resume?.education) && resume.education.length > 0
      ? resume.education.map(edu => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          year: edu.year || ''
        }))
      : [{ degree: '', institution: '', year: '' }]
  );

  // Structured Projects
  const [projects, setProjects] = useState(
    Array.isArray(resume?.projects) && resume.projects.length > 0
      ? resume.projects.map(p => ({
          name: p.name || '',
          link: p.link || '',
          description: p.description || (Array.isArray(p.bullets) ? p.bullets.join('\n') : '')
        }))
      : [{ name: '', link: '', description: '' }]
  );

  // Raw JSON state (for advanced mode)
  const [rawJson, setRawJson] = useState('');
  const [saving, setSaving] = useState(false);

  // Import profile helper
  const handleImportProfile = () => {
    if (!user) return;
    setContact(prev => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      location: user.location || prev.location,
      linkedin: user.links?.linkedin || prev.linkedin,
      github: user.links?.github || prev.github
    }));
    if (user.summary) setSummary(user.summary);
    if (user.skills && user.skills.length > 0) setSkillsStr(user.skills.join(', '));
    toast.success('Imported career profile information!');
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperience(prev => [...prev, { title: '', company: '', location: '', duration: '', description: '' }]);
  };

  const handleUpdateExperience = (index, field, value) => {
    setExperience(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveExperience = (index) => {
    setExperience(prev => prev.filter((_, i) => i !== index));
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducation(prev => [...prev, { degree: '', institution: '', year: '' }]);
  };

  const handleUpdateEducation = (index, field, value) => {
    setEducation(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveEducation = (index) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };

  // Projects handlers
  const handleAddProject = () => {
    setProjects(prev => [...prev, { name: '', link: '', description: '' }]);
  };

  const handleUpdateProject = (index, field, value) => {
    setProjects(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveProject = (index) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to build normalized payload
  const buildPayload = () => {
    const parsedSkills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    const parsedCertifications = certificationsStr.split(',').map(c => c.trim()).filter(Boolean);

    const formattedExperience = experience
      .filter(e => e.title.trim() || e.company.trim())
      .map(e => {
        const bullets = e.description
          ? e.description.split('\n').map(b => b.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean)
          : [];
        return {
          title: e.title.trim(),
          company: e.company.trim(),
          location: e.location.trim(),
          duration: e.duration.trim(),
          description: e.description.trim(),
          bullets
        };
      });

    const formattedEducation = education
      .filter(e => e.degree.trim() || e.institution.trim())
      .map(e => ({
        degree: e.degree.trim(),
        institution: e.institution.trim(),
        year: e.year.trim()
      }));

    const formattedProjects = projects
      .filter(p => p.name.trim())
      .map(p => {
        const bullets = p.description
          ? p.description.split('\n').map(b => b.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean)
          : [];
        return {
          name: p.name.trim(),
          link: p.link.trim(),
          description: p.description.trim(),
          bullets
        };
      });

    return normalizeResumeData({
      title: title.trim() || 'Untitled Resume',
      contact,
      summary: summary.trim(),
      skills: parsedSkills,
      certifications: parsedCertifications,
      experience: formattedExperience,
      education: formattedEducation,
      projects: formattedProjects,
      skillCategories: resume?.skillCategories
    });
  };

  // Switch between Forms and Raw JSON mode
  const handleToggleMode = () => {
    if (editorMode === 'forms') {
      const payload = buildPayload();
      setRawJson(JSON.stringify(payload, null, 2));
      setEditorMode('json');
    } else {
      try {
        const parsed = JSON.parse(rawJson);
        if (typeof parsed.title === 'string') setTitle(parsed.title);
        if (parsed.contact) setContact(parsed.contact);
        if (typeof parsed.summary === 'string') setSummary(parsed.summary);
        if (Array.isArray(parsed.skills)) setSkillsStr(parsed.skills.join(', '));
        if (Array.isArray(parsed.certifications)) setCertificationsStr(parsed.certifications.join(', '));
        if (Array.isArray(parsed.experience)) {
          setExperience(parsed.experience.map(e => ({
            title: e.title || '',
            company: e.company || '',
            location: e.location || '',
            duration: e.duration || '',
            description: e.description || (Array.isArray(e.bullets) ? e.bullets.join('\n') : '')
          })));
        }
        if (Array.isArray(parsed.education)) {
          setEducation(parsed.education.map(e => ({
            degree: e.degree || '',
            institution: e.institution || '',
            year: e.year || ''
          })));
        }
        if (Array.isArray(parsed.projects)) {
          setProjects(parsed.projects.map(p => ({
            name: p.name || '',
            link: p.link || '',
            description: p.description || (Array.isArray(p.bullets) ? p.bullets.join('\n') : '')
          })));
        }
        setEditorMode('forms');
      } catch (err) {
        toast.error('Invalid JSON. Fix syntax before switching back to form view.');
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      let finalPayload;
      if (editorMode === 'json') {
        try {
          finalPayload = JSON.parse(rawJson);
        } catch (err) {
          toast.error('Invalid JSON format');
          setSaving(false);
          return;
        }
      } else {
        finalPayload = buildPayload();
      }

      await onSave(resume._id, finalPayload);
      toast.success('Resume updated successfully! (New version created)');
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            ATS Semantic Profile Editor
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-light)', margin: '4px 0 0 0' }}>
            Updates apply cleanly to ATS scoring, job matching, and template redesign
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-warning" style={{ fontSize: '11px' }}>
            Version {resume?.currentVersion || 1} → v{(resume?.currentVersion || 1) + 1}
          </span>
          <button
            type="button"
            onClick={handleToggleMode}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiSliders /> {editorMode === 'forms' ? 'Advanced JSON' : 'Structured Forms'}
          </button>
        </div>
      </div>

      {/* Mode A: Advanced JSON Editor */}
      {editorMode === 'json' ? (
        <div>
          <div style={{ marginBottom: '16px', background: 'var(--bg)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-light)' }}>
            <strong>Raw JSON Mode:</strong> Edit the normalized resume object directly. Ensure valid JSON structure before saving.
          </div>
          <textarea
            rows={22}
            value={rawJson}
            onChange={e => setRawJson(e.target.value)}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5', padding: '14px', borderRadius: '8px' }}
          />
        </div>
      ) : (
        /* Mode B: Structured Form View */
        <form onSubmit={handleSubmit}>
          {/* Resume Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Resume Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer Resume"
              required
            />
          </div>

          {/* Section: Contact Information */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiUser style={{ color: 'var(--primary)' }} /> Contact Details
              </h3>
              <button
                type="button"
                onClick={handleImportProfile}
                className="btn btn-outline"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
              >
                Import from Profile
              </button>
            </div>

            <div className="grid-2" style={{ gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px' }}>Full Name</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={e => setContact({ ...contact, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px' }}>Email Address</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={e => setContact({ ...contact, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px' }}>Phone Number</label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={e => setContact({ ...contact, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px' }}>Location</label>
                <input
                  type="text"
                  value={contact.location}
                  onChange={e => setContact({ ...contact, location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px' }}>LinkedIn URL</label>
                <input
                  type="text"
                  value={contact.linkedin}
                  onChange={e => setContact({ ...contact, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px' }}>GitHub URL</label>
                <input
                  type="text"
                  value={contact.github}
                  onChange={e => setContact({ ...contact, github: e.target.value })}
                  placeholder="github.com/username"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px' }}>Portfolio / Website</label>
                <input
                  type="text"
                  value={contact.website}
                  onChange={e => setContact({ ...contact, website: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Section: Summary */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
              Professional Summary
            </h3>
            <textarea
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Results-driven Software Engineer with 4+ years of experience building scalable applications..."
              style={{ width: '100%', fontSize: '13.5px', lineHeight: '1.5' }}
            />
          </div>

          {/* Section: Technical Skills */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCode style={{ color: 'var(--primary)' }} /> Technical Skills
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>
              Enter skills separated by commas. These will be parsed for ATS keyword matching.
            </p>
            <input
              type="text"
              value={skillsStr}
              onChange={e => setSkillsStr(e.target.value)}
              placeholder="React.js, Next.js, Node.js, Express, MongoDB, REST APIs, TypeScript, Docker"
              style={{ width: '100%' }}
            />
          </div>

          {/* Section: Work Experience */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiBriefcase style={{ color: 'var(--primary)' }} /> Work Experience ({experience.length})
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FiPlus /> Add Position
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experience.map((exp, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary)' }}>Position #{idx + 1}</span>
                    {experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                        title="Remove position"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="grid-2" style={{ gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px' }}>Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={e => handleUpdateExperience(idx, 'title', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px' }}>Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={e => handleUpdateExperience(idx, 'company', e.target.value)}
                        placeholder="TechCorp Inc."
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px' }}>Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={e => handleUpdateExperience(idx, 'location', e.target.value)}
                        placeholder="New York, NY / Remote"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px' }}>Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={e => handleUpdateExperience(idx, 'duration', e.target.value)}
                        placeholder="2022 - Present"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px' }}>Responsibilities & Achievements (One bullet per line)</label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={e => handleUpdateExperience(idx, 'description', e.target.value)}
                      placeholder="• Architected and shipped real-time dashboard microservices&#10;• Reduced API latency by 35% through Redis caching"
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Education */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiBookOpen style={{ color: 'var(--primary)' }} /> Education ({education.length})
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FiPlus /> Add Degree
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {education.map((edu, idx) => (
                <div key={idx} style={{ padding: '14px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>Education #{idx + 1}</span>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                        title="Remove education"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="grid-3" style={{ gap: '10px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11.5px' }}>Degree / Program</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={e => handleUpdateEducation(idx, 'degree', e.target.value)}
                        placeholder="B.Tech in Computer Science"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px' }}>Graduation Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={e => handleUpdateEducation(idx, 'year', e.target.value)}
                        placeholder="2023"
                      />
                    </div>
                    <div style={{ gridColumn: 'span 3' }}>
                      <label style={{ fontSize: '11.5px' }}>Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={e => handleUpdateEducation(idx, 'institution', e.target.value)}
                        placeholder="State University of New York"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Projects */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiFolder style={{ color: 'var(--primary)' }} /> Projects ({projects.length})
              </h3>
              <button
                type="button"
                onClick={handleAddProject}
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FiPlus /> Add Project
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {projects.map((proj, idx) => (
                <div key={idx} style={{ padding: '14px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>Project #{idx + 1}</span>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                        title="Remove project"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="grid-2" style={{ gap: '10px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px' }}>Project Name</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={e => handleUpdateProject(idx, 'name', e.target.value)}
                        placeholder="TigerResume Platform"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px' }}>Project / Repo Link (Optional)</label>
                      <input
                        type="text"
                        value={proj.link}
                        onChange={e => handleUpdateProject(idx, 'link', e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px' }}>Project Highlights & Tech Used (One bullet per line)</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={e => handleUpdateProject(idx, 'description', e.target.value)}
                      placeholder="• Developed with React, Node.js and MongoDB&#10;• Implemented automated ATS compatibility scoring engine"
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Certifications */}
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              Certifications
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '10px' }}>
              Comma-separated list of certifications or credentials.
            </p>
            <input
              type="text"
              value={certificationsStr}
              onChange={e => setCertificationsStr(e.target.value)}
              placeholder="AWS Certified Solutions Architect, Meta Front-End Developer"
              style={{ width: '100%' }}
            />
          </div>
        </form>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14px' }}
        >
          <FiSave /> {saving ? 'Saving & Creating Version...' : 'Save Changes as New Version'}
        </button>
      </div>
    </div>
  );
}

