'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import ChatBox from '../../components/chat/ChatBox';
import { useResume } from '../../hooks/useResume';
import { useAuth } from '../../hooks/useAuth';
import { fetchJobDescriptions } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiLayers, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AskResumePage() {
  const { resumes, activeResume, loadResumes } = useResume();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    } else if (user) {
      loadResumes();
      fetchJobDescriptions()
        .then(res => setJobs(res.data || []))
        .catch(() => toast.error('Failed to load target job descriptions'));
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
    return <Loader text="Loading AI Resume Assistant..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Ask Resume AI Assistant</h1>
          <p>Ask natural-language questions about your resume, target job compatibility, ATS score, and skill gaps</p>
        </div>

        {/* Selection Pair Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div className="grid-2">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Active Resume *</label>
              {resumes.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--danger)' }}>No resumes found. Upload a resume first.</p>
              ) : (
                <select value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.title || r.originalFileName} (v{r.currentVersion || 1})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Target Job Description (Optional Context)</label>
              <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
                <option value="">-- General Resume Q&A --</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>
                    {j.title} {j.company ? `(${j.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Chat Window */}
        <ChatBox
          resumeId={selectedResumeId}
          jobDescriptionId={selectedJobId}
        />
      </div>
    </div>
  );
}

