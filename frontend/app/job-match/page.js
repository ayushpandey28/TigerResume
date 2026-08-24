'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import JobMatchScore from '../../components/job/JobMatchScore';
import MatchedSkills from '../../components/job/MatchedSkills';
import MissingSkills from '../../components/job/MissingSkills';
import MissingKeywords from '../../components/job/MissingKeywords';
import { useResume } from '../../hooks/useResume';
import { useAuth } from '../../hooks/useAuth';
import { fetchJobDescriptions, matchResumeToJobAPI } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiLayers, FiCheckCircle, FiAlertTriangle, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function JobMatchPage() {
  const { resumes, activeResume, loadResumes } = useResume();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    } else if (user) {
      loadResumes();
      fetchJobDescriptions()
        .then(res => setJobs(res.data || []))
        .catch(() => toast.error('Failed to load job descriptions'));
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

  const handleMatch = async () => {
    if (!selectedResumeId || !selectedJobId) {
      toast.error('Please select both a resume and a target job description');
      return;
    }

    setLoading(true);
    setMatchResult(null);

    try {
      const res = await matchResumeToJobAPI({
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId
      });
      setMatchResult(res.data);
      toast.success('Job compatibility match completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Job match failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader text="Loading Job Match Engine..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Resume ↔ Job Compatibility Match</h1>
          <p>Compare your resume against a specific target Job Description to discover skill matches, gaps, and keyword alignment</p>
        </div>

        {/* Setup Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLayers style={{ color: 'var(--primary)' }} /> Select Target Pair
          </h3>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label>Select Resume</label>
              {resumes.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--danger)' }}>No resumes found under &apos;My Resume&apos;.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                >
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
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                >
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
            onClick={handleMatch}
            className="btn btn-primary"
            disabled={loading || resumes.length === 0 || jobs.length === 0}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Evaluating Resume ↔ Job Compatibility...' : 'Run Job Compatibility Match'}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && <Loader text="Comparing skills, keywords, experience, and project relevance..." />}

        {/* Results Section */}
        {matchResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <JobMatchScore
              matchPercentage={matchResult.matchPercentage}
              breakdown={matchResult.breakdown}
            />

            <div className="grid-2">
              <MatchedSkills matchedSkills={matchResult.matchedSkills} />
              <MissingSkills
                missingSkills={matchResult.missingSkills}
                missingPreferredSkills={matchResult.missingPreferredSkills}
              />
            </div>

            <MissingKeywords
              matchedKeywords={matchResult.matchedKeywords}
              missingKeywords={matchResult.missingKeywords}
            />

            {/* Strengths, Gaps & Suggestions */}
            <div className="grid-2">
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheckCircle /> Alignment Strengths
                </h3>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
                  {matchResult.strengths?.map((str, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiAlertTriangle /> Identified Gaps
                </h3>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
                  {matchResult.gaps?.map((g, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiZap /> Actionable Suggestions
              </h3>
              <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
                {matchResult.suggestions?.map((sug, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{sug}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

