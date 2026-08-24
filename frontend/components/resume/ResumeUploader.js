'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ResumeUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
      } else {
        toast.error('Only PDF files are allowed');
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 5 * 1024 * 1024
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      if (onUploadSuccess) {
        await onUploadSuccess(file);
      }
      toast.success('Resume uploaded and parsed successfully!');
      setFile(null);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '32px' }}>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed',
          borderColor: isDragActive ? 'var(--primary)' : 'var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px 24px',
          textAlign: 'center',
          background: isDragActive ? 'rgba(249, 115, 22, 0.05)' : 'var(--bg)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <input {...getInputProps()} />
        <FiUploadCloud size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          {isDragActive ? 'Drop your PDF resume here' : 'Drag & drop your resume PDF here'}
        </h3>
        <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '16px' }}>
          Supports PDF format only (Max size: 5MB)
        </p>
        <button type="button" className="btn btn-outline" style={{ pointerEvents: 'none' }}>
          Browse File
        </button>
      </div>

      {file && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#F1F5F9',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiFileText size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px' }}>{file.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={handleUpload}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing & Parsing...' : 'Upload & Parse'}
          </button>
        </div>
      )}
    </div>
  );
}

