'use client';
import { useEffect, useState } from 'react';
import ResumePreview from './ResumePreview';
import { generateResumePdf, getResumeVersions, getOriginalResumeBlob, generateEditedResumePdf } from '../../lib/api';
import { FiDownload, FiCheck, FiSliders, FiFileText, FiLayers, FiLayout } from 'react-icons/fi';
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
  const [downloadTab, setDownloadTab] = useState('original'); // 'original' | 'edited' | 'redesign'
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

  // 1. Download Original Uploaded File
  const handleDownloadOriginal = async () => {
    setDownloading(true);
    try {
      const blob = await getOriginalResumeBlob(resume._id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      const fileName = resume.originalDocument?.originalFileName || resume.originalFileName || 'original_resume.pdf';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Original uploaded file downloaded!');
    } catch (err) {
      toast.error('Failed to download original document.');
    } finally {
      setDownloading(false);
    }
  };

  // 2. Download Edited Original (Document Model)
  const handleDownloadEdited = async () => {
    setDownloading(true);
    try {
      const blob = await generateEditedResumePdf(resume._id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      const candidateName = resume.documentModel?.header?.name || resume.contact?.name || resume.title || 'Candidate';
      a.download = `${candidateName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Edited_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Edited layout PDF downloaded!');
    } catch (err) {
      toast.error('Failed to generate edited PDF.');
    } finally {
      setDownloading(false);
    }
  };

  // 3. Download Redesigned Resume (TigerResume Template)
  const handleDownloadRedesigned = async () => {
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

      toast.success('Redesigned template PDF generated successfully!');
    } catch (err) {
      toast.error('Failed to generate template PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab Switcher for 3 Separate Download Operations */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: 'var(--text)' }}>
          Select Export Type
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setDownloadTab('original')}
            className={`btn ${downloadTab === 'original' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <FiFileText /> 1. Download Original
          </button>
          <button
            type="button"
            onClick={() => setDownloadTab('edited')}
            className={`btn ${downloadTab === 'edited' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <FiLayers /> 2. Download Edited Original
          </button>
          <button
            type="button"
            onClick={() => setDownloadTab('redesign')}
            className={`btn ${downloadTab === 'redesign' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <FiLayout /> 3. Download Redesigned Resume
          </button>
        </div>
      </div>

      {/* Mode 1: Download Original Uploaded Document */}
      {downloadTab === 'original' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiFileText size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text)' }}>
                Download Original File
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-light)', marginTop: '4px', maxWidth: '600px' }}>
                Returns the exact, unaltered file you originally uploaded. No re-formatting, no re-generation, 100% source-of-truth preservation.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span><strong>File:</strong> {resume.originalDocument?.originalFileName || resume.originalFileName}</span>
                {resume.originalDocument?.fileSize ? (
                  <span><strong>Size:</strong> {(resume.originalDocument.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadOriginal}
            className="btn btn-primary"
            disabled={downloading}
            style={{ padding: '12px 24px', fontSize: '14.5px' }}
          >
            <FiDownload /> {downloading ? 'Downloading...' : 'Download Original File'}
          </button>
        </div>
      )}

      {/* Mode 2: Download Edited Original Layout */}
      {downloadTab === 'edited' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiLayers size={24} style={{ color: '#0284C7' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text)' }}>
                Download Edited Original Layout
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-light)', marginTop: '4px', maxWidth: '600px' }}>
                Generates a high-fidelity PDF directly from your layout-aware Document Model. Incorporates any edits you made in the Document Editor while strictly preserving your original sections, custom headings, and ordering.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span><strong>Sections:</strong> {resume.documentModel?.sections?.length || 'Preserved'}</span>
                <span><strong>Version:</strong> v{resume.currentVersion || 1}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadEdited}
            className="btn btn-primary"
            disabled={downloading}
            style={{ padding: '12px 24px', fontSize: '14.5px', background: '#0284C7', borderColor: '#0284C7' }}
          >
            <FiDownload /> {downloading ? 'Generating Edited PDF...' : 'Download Edited Original PDF'}
          </button>
        </div>
      )}

      {/* Mode 3: Download Redesigned Resume (TigerResume Templates) */}
      {downloadTab === 'redesign' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSliders style={{ color: 'var(--primary)' }} /> Template Redesign Configuration
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
                      background: accentColor === c.id ? 'var(--border)' : 'var(--bg-card)',
                      color: 'var(--text)',
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
              onClick={handleDownloadRedesigned}
              className="btn btn-primary"
              disabled={downloading}
              style={{ width: '100%', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FiDownload /> {downloading ? 'Generating Redesigned Template PDF...' : `Download ${selectedTemplate.toUpperCase()} Template PDF`}
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
      )}
    </div>
  );
}
