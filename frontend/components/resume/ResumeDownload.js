'use client';
import { useEffect, useState } from 'react';
import ResumePreview from './ResumePreview';
import { generateResumePdf, getResumeVersions } from '../../lib/api';
import { FiDownload, FiCheck, FiSliders } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { id: 'classic', name: 'Classic', desc: 'Clean ATS-friendly layout' },
  { id: 'modern', name: 'Modern', desc: 'Professional modern layout' },
  { id: 'creative', name: 'Creative', desc: 'Distinctive recruiter-friendly layout' }
];

const COLORS = [
  { id: 'default', label: 'Default', hex: '#1E293B' },
  { id: 'blue', label: 'Royal Blue', hex: '#2563EB' },
  { id: 'green', label: 'Emerald', hex: '#059669' },
  { id: 'dark', label: 'Slate Dark', hex: '#0F172A' }
];

export default function ResumeDownload({ resume }) {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [versions, setVersions] = useState([]);
  const [accentColor, setAccentColor] = useState('default');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (resume?._id) {
      setSelectedVersion(resume.currentVersion || 1);
      getResumeVersions(resume._id)
        .then(res => setVersions(res.data || []))
        .catch(() => setVersions([]));
    }
  }, [resume]);

  if (!resume) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await generateResumePdf(resume._id, {
        template: selectedTemplate,
        version: selectedVersion ? Number(selectedVersion) : undefined,
        customization: { accentColor }
      });

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;

      const candidateName = resume.contact?.name || resume.title || 'Candidate';
      const sanitizedName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `${sanitizedName}_${selectedTemplate}_Resume.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Professional PDF generated successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Controls Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSliders style={{ color: 'var(--primary)' }} /> Export & Template Configuration
        </h3>

        <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
          {/* Template Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Select Template</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`btn ${selectedTemplate === tmpl.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, padding: '10px 8px', fontSize: '13px' }}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Version Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Resume Version</label>
            <select
              value={selectedVersion}
              onChange={e => setSelectedVersion(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '13px' }}
            >
              <option value={resume.currentVersion || 1}>
                Current Active Version (v{resume.currentVersion || 1})
              </option>
              {versions.map(v => (
                v.version !== resume.currentVersion && (
                  <option key={v.version} value={v.version}>
                    Version {v.version} - {new Date(v.createdAt).toLocaleDateString()}
                  </option>
                )
              ))}
            </select>
          </div>
        </div>

        {/* Customization Options */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Accent Color</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setAccentColor(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: accentColor === c.id ? `2px solid ${c.hex}` : '1px solid var(--border)',
                  background: accentColor === c.id ? '#F1F5F9' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex }} />
                {c.label} {accentColor === c.id && <FiCheck style={{ fontSize: '12px' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="btn btn-primary"
          disabled={downloading}
          style={{ width: '100%', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <FiDownload /> {downloading ? 'Generating Professional ATS PDF...' : `Download ${selectedTemplate.toUpperCase()} PDF`}
        </button>
      </div>

      {/* Live Template Preview */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-light)' }}>
          Live Template Preview ({selectedTemplate.toUpperCase()})
        </h3>
        <ResumePreview
          resume={resume}
          templateId={selectedTemplate}
          customization={{ accentColor }}
        />
      </div>
    </div>
  );
}

