'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import JobInput from '../../components/job/JobInput';
import JobAnalysis from '../../components/job/JobAnalysis';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchJobDescriptions,
  createJobDescription,
  updateJobDescriptionData,
  deleteJobDescriptionById,
  analyzeJobDescriptionAI
} from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiPlus, FiBriefcase, FiTrash2, FiEdit, FiCpu, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function JobDescriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await fetchJobDescriptions();
      setJobs(res.data || []);
      if (res.data && res.data.length > 0 && !activeJob) {
        setActiveJob(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load job descriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    } else if (user) {
      loadJobs();
    }
  }, [user, authLoading, router]);

  const handleCreateJob = async (formData) => {
    const res = await createJobDescription(formData);
    toast.success('Job description saved!');
    setShowInput(false);
    await loadJobs();
    if (res.data) setActiveJob(res.data);
  };

  const handleCreateAndAnalyze = async (formData) => {
    const res = await createJobDescription(formData);
    toast.success('Job description saved! Running AI analysis...');
    setShowInput(false);
    if (res.data) {
      await handleAnalyze(res.data._id);
    }
  };

  const handleAnalyze = async (jobId) => {
    setAnalyzingId(jobId);
    try {
      const res = await analyzeJobDescriptionAI(jobId);
      if (res.data && res.data.available === false) {
        toast.error(res.data.message || 'AI service unavailable');
      } else if (res.data && res.data.jobDescription) {
        toast.success('Job description analyzed successfully!');
        setActiveJob(res.data.jobDescription);
        await loadJobs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze job description');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job description?')) {
      try {
        await deleteJobDescriptionById(jobId);
        toast.success('Job description deleted');
        if (activeJob?._id === jobId) setActiveJob(null);
        await loadJobs();
      } catch (err) {
        toast.error('Failed to delete job description');
      }
    }
  };

  if (authLoading || (loading && jobs.length === 0)) {
    return <Loader text="Loading Job Descriptions..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Job Descriptions</h1>
            <p>Paste, manage, and analyze target Job Descriptions for ATS scoring and skills matching</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/job-description/generate" className="btn btn-outline">
              🤖 Generate AI Sample JD
            </Link>
            <button
              onClick={() => { setShowInput(!showInput); setEditingJob(null); }}
              className="btn btn-primary"
            >
              <FiPlus /> {showInput ? 'Cancel' : 'Add New JD'}
            </button>
          </div>
        </div>

        {/* Input Form Modal / Accordion */}
        {showInput && (
          <div style={{ marginBottom: '24px' }}>
            <JobInput
              onSave={handleCreateJob}
              onAnalyze={handleCreateAndAnalyze}
              initialData={editingJob}
            />
          </div>
        )}

        {jobs.length === 0 && !showInput ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <FiBriefcase size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Job Descriptions Added Yet</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
              Paste a target Job Description to extract required skills, tech keywords, and enable job-specific ATS scoring.
            </p>
            <button onClick={() => setShowInput(true)} className="btn btn-primary">
              Paste Job Description
            </button>
          </div>
        ) : (
          <div className="grid-3" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
            {/* List Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-light)' }}>
                Saved Target Jobs ({jobs.length})
              </h3>
              {jobs.map((j) => {
                const isSelected = activeJob?._id === j._id;
                return (
                  <div
                    key={j._id}
                    className="card"
                    onClick={() => setActiveJob(j)}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      background: isSelected ? 'rgba(249, 115, 22, 0.04)' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                        {j.title}
                      </h4>
                      {j.isAIGenerated && (
                        <span className="badge badge-warning" style={{ fontSize: '10px' }}>AI</span>
                      )}
                    </div>
                    {j.company && (
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px' }}>{j.company}</p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {j.requiredSkills?.length || 0} skills parsed
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(j._id); }}
                        style={{ color: 'var(--danger)', background: 'transparent', padding: '4px' }}
                        title="Delete Job Description"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Job View & Actions */}
            {activeJob && (
              <div>
                <div className="card" style={{ marginBottom: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Created on {new Date(activeJob.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAnalyze(activeJob._id)}
                      className="btn btn-primary"
                      disabled={analyzingId === activeJob._id}
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      <FiCpu /> {analyzingId === activeJob._id ? 'Analyzing with AI...' : 'Analyze Skills & Keywords with AI'}
                    </button>
                  </div>
                </div>

                <JobAnalysis jobDescription={activeJob} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

