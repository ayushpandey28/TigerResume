'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import ResumePreview from '../../components/resume/ResumePreview';
import ResumeEditor from '../../components/resume/ResumeEditor';
import { useResume } from '../../hooks/useResume';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FiUpload, FiEdit, FiEye, FiTrash2, FiFileText, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const { resumes, activeResume, setActiveResume, loading, loadResumes, loadResumeById, updateResume, deleteResume, versions, loadVersions } = useResume();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState('preview'); // 'preview' | 'edit'
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    } else if (user) {
      loadResumes();
    }
  }, [user, authLoading, router, loadResumes]);

  const handleSelectResume = async (resume) => {
    await loadResumeById(resume._id);
    setMode('preview');
    setShowVersions(false);
  };

  const handleSaveEdit = async (id, updatedData) => {
    await updateResume(id, updatedData);
    setMode('preview');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(id);
        toast.success('Resume deleted');
      } catch (err) {
        toast.error('Failed to delete resume');
      }
    }
  };

  const handleViewVersions = async (id) => {
    await loadVersions(id);
    setShowVersions(!showVersions);
  };

  if (authLoading || (loading && resumes.length === 0)) {
    return <Loader text="Loading your resumes..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>My Resume</h1>
            <p>Upload, view, edit, and manage your resumes</p>
          </div>
          <Link href="/resume/upload" className="btn btn-primary">
            <FiUpload /> Upload New Resume
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <FiFileText size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No resumes uploaded yet</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>Upload your PDF resume to start ATS scoring and job matching.</p>
            <Link href="/resume/upload" className="btn btn-primary">
              Upload Resume Now
            </Link>
          </div>
        ) : (
          <div className="grid-3" style={{ gridTemplateColumns: '300px 1fr', alignItems: 'start' }}>
            {/* Sidebar list of user resumes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-light)' }}>
                Your Resumes ({resumes.length})
              </h3>
              {resumes.map((r) => {
                const isSelected = activeResume?._id === r._id;
                return (
                  <div
                    key={r._id}
                    className="card"
                    onClick={() => handleSelectResume(r)}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      background: isSelected ? 'rgba(249, 115, 22, 0.04)' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                        {r.title || r.originalFileName}
                      </h4>
                      <span className="badge badge-info" style={{ fontSize: '11px' }}>
                        v{r.currentVersion || 1}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>
                      {r.originalFileName}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(r.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
                        style={{ color: 'var(--danger)', background: 'transparent', padding: '4px' }}
                        title="Delete resume"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Resume Details & Controls */}
            {activeResume && (
              <div>
                {/* Control bar */}
                <div className="card" style={{ marginBottom: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setMode('preview')}
                      className={`btn ${mode === 'preview' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      <FiEye /> Preview
                    </button>
                    <button
                      onClick={() => setMode('edit')}
                      className={`btn ${mode === 'edit' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleViewVersions(activeResume._id)}
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      <FiClock /> Versions ({activeResume.currentVersion || 1})
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href="/ats" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                      Check ATS Score
                    </Link>
                    <Link href="/resume/improve" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                      Optimize
                    </Link>
                  </div>
                </div>

                {/* Version History List */}
                {showVersions && (
                  <div className="card" style={{ marginBottom: '20px', padding: '16px 24px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Version History</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {versions.map(v => (
                        <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px', fontSize: '13px' }}>
                          <span><strong>Version {v.version}</strong> — {v.changes || 'Saved version'}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{new Date(v.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View / Edit Mode */}
                {mode === 'preview' ? (
                  <ResumePreview resume={activeResume} />
                ) : (
                  <ResumeEditor
                    resume={activeResume}
                    onSave={handleSaveEdit}
                    onCancel={() => setMode('preview')}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

