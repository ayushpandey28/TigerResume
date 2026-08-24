'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Loader from '../../../components/Loader';
import ResumeDownload from '../../../components/resume/ResumeDownload';
import { useResume } from '../../../hooks/useResume';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ResumeDownloadPage() {
  const { resumes, activeResume, loadResumes } = useResume();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    } else if (user) {
      loadResumes();
    }
  }, [user, authLoading, router, loadResumes]);

  useEffect(() => {
    if (activeResume && !selectedResumeId) {
      setSelectedResumeId(activeResume._id);
    } else if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0]._id);
    }
  }, [activeResume, resumes, selectedResumeId]);

  if (authLoading) {
    return <Loader text="Loading Resume Export Center..." />;
  }

  const selectedResume = resumes.find(r => r._id === selectedResumeId) || activeResume || resumes[0];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Resume Templates & PDF Export</h1>
          <p>Export your original or AI-optimized resume using ATS-friendly Classic, Modern, and Creative templates</p>
        </div>

        {/* Resume Selection Header */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Select Resume to Export:</label>
            <select
              value={selectedResumeId}
              onChange={e => setSelectedResumeId(e.target.value)}
              style={{ minWidth: '280px', padding: '10px', fontSize: '13.5px' }}
            >
              {resumes.map(r => (
                <option key={r._id} value={r._id}>
                  {r.title || r.originalFileName} (v{r.currentVersion || 1})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Download & Preview Controls */}
        {selectedResume ? (
          <ResumeDownload resume={selectedResume} />
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-light)' }}>No resume found. Please upload a resume first.</p>
          </div>
        )}
      </div>
    </div>
  );
}

