'use client';
import { useState, useEffect } from 'react';
import { getOriginalResumeBlob } from '../../lib/api';
import { FiDownload, FiExternalLink, FiFileText, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OriginalDocumentViewer({ resume }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activeUrl = null;
    if (resume?._id) {
      setLoading(true);
      setError(null);
      getOriginalResumeBlob(resume._id)
        .then((blob) => {
          activeUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          setBlobUrl(activeUrl);
        })
        .catch((err) => {
          console.error('Failed to load original PDF:', err);
          setError('Could not load in-browser preview of original document.');
        })
        .finally(() => {
          setLoading(false);
        });
    }

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
    };
  }, [resume?._id]);

  const handleDownload = async () => {
    if (!resume?._id) return;
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
      toast.success('Original file downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download original document.');
    }
  };

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  if (!resume) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-light)' }}>No resume selected to view.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Informational Banner & Controls Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiFileText size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                Original Document
              </h3>
              <span className="badge badge-success" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiCheckCircle size={12} /> Source of Truth
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-light)', marginTop: '2px' }}>
              {resume.originalDocument?.originalFileName || resume.originalFileName} • Unaltered original upload
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {blobUrl && (
            <button
              onClick={handleOpenNewTab}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
              title="Open full PDF in a new browser tab"
            >
              <FiExternalLink /> Open in Tab
            </button>
          )}
          <button
            onClick={handleDownload}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '12.5px' }}
          >
            <FiDownload /> Download Original
          </button>
        </div>
      </div>

      {/* PDF Viewer Canvas */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '650px', background: 'var(--bg-card)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '650px', gap: '12px' }}>
            <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>Loading original document preview...</p>
          </div>
        ) : error || !blobUrl ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <FiFileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Original Document Available</h4>
            <p style={{ color: 'var(--text-light)', fontSize: '13px', maxWidth: '450px', margin: '0 auto 20px auto' }}>
              The original file is stored safely. You can download it directly or switch to Edit Document to view the extracted layout.
            </p>
            <button onClick={handleDownload} className="btn btn-primary">
              <FiDownload /> Download Original PDF
            </button>
          </div>
        ) : (
          <object
            data={blobUrl}
            type="application/pdf"
            width="100%"
            height="850px"
            style={{ display: 'block', border: 'none' }}
          >
            <iframe
              src={blobUrl}
              width="100%"
              height="850px"
              style={{ border: 'none' }}
              title="Original Resume PDF"
            >
              <p>Your browser does not support inline PDF viewing. <button onClick={handleDownload} className="btn btn-outline">Download Original</button></p>
            </iframe>
          </object>
        )}
      </div>
    </div>
  );
}
