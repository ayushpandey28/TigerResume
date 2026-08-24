'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import SkillGap from '../../components/skills/SkillGap';
import SkillRoadmap from '../../components/skills/SkillRoadmap';
import { useResume } from '../../hooks/useResume';
import { useAuth } from '../../hooks/useAuth';
import { fetchJobDescriptions, analyzeSkillGapAPI } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiLayers, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SkillGapPage() {
  const { resumes, activeResume, loadResumes } = useResume();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [gapResult, setGapResult] = useState(null);

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
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [activeResume, resumes, jobs, selectedResumeId, selectedJobId]);

  const handleAnalyze = async () => {
    if (!selectedResumeId || !selectedJobId) {
      toast.error('Please select both a resume and a target job description');
      return;
    }

    setLoading(true);
    setGapResult(null);

    try {
      const res = await analyzeSkillGapAPI({
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId
      });
      setGapResult(res.data);
      toast.success('Skill gap analysis and roadmap generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Skill gap analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader text="Loading Skill Gap Engine..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Skill Gap Analysis & Learning Roadmap</h1>
          <p>Discover which required skills you cover, identify missing priorities, and get a step-by-step learning progression roadmap</p>
        </div>

        {/* Setup Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLayers style={{ color: 'var(--primary)' }} /> Select Pair for Skill Analysis
          </h3>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label>Select Resume</label>
              {resumes.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--danger)' }}>No resumes found under &apos;My Resume&apos;.</p>
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
              <label>Select Target Job Description</label>
              {jobs.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--danger)' }}>No jobs found under &apos;Job Descriptions&apos;.</p>
              ) : (
                <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>
                      {j.title} {j.company ? `(${j.company})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="btn btn-primary"
            disabled={loading || resumes.length === 0 || jobs.length === 0}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Evaluating Skill Coverage & Building Roadmap...' : 'Analyze Skill Gap & Learning Roadmap'}
          </button>
        </div>

        {/* Loading State */}
        {loading && <Loader text="Calculating required skill coverage and prioritizing skill gaps..." />}

        {/* Results Output */}
        {gapResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SkillGap
              skillCoverage={gapResult.skillCoverage}
              existingSkills={gapResult.existingSkills}
              matchedRequiredSkills={gapResult.matchedRequiredSkills}
              missingRequiredSkills={gapResult.missingRequiredSkills}
              matchedPreferredSkills={gapResult.matchedPreferredSkills}
              missingPreferredSkills={gapResult.missingPreferredSkills}
              gaps={gapResult.gaps}
            />

            <SkillRoadmap roadmap={gapResult.roadmap} />
          </div>
        )}
      </div>
    </div>
  );
}

