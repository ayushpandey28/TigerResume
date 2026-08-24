'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import ATSScoreCard from '../../components/ats/ATSScoreCard';
import ScoreBreakdown from '../../components/ats/ScoreBreakdown';
import KeywordAnalysis from '../../components/ats/KeywordAnalysis';
import FormattingAnalysis from '../../components/ats/FormattingAnalysis';
import { useResume } from '../../hooks/useResume';
import { useAuth } from '../../hooks/useAuth';
import { analyzeATS } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiTarget, FiFileText, FiBriefcase, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AtsPage() {
  const { resumes, activeResume, loadResumes } = useResume();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobText, setJobText] = useState('');
  const [loading, setLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

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

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume to analyze');
      return;
    }

    setLoading(true);
    setAtsResult(null);

    try {
      const res = await analyzeATS({
        resumeId: selectedResumeId,
        jobText: jobText.trim() || undefined
      });
      setAtsResult(res.data);
      toast.success('ATS analysis completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'ATS analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader text="Loading ATS Engine..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>ATS Compatibility Score</h1>
          <p>Analyze your resume against ATS criteria or a specific target Job Description</p>
        </div>

        {/* Setup Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiTarget style={{ color: 'var(--primary)' }} /> ATS Analysis Configuration
          </h3>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            {/* Resume Selection */}
            <div>
              <label>Select Resume</label>
              {resumes.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--danger)' }}>
                  No resumes found. Please upload a resume first under &apos;My Resume&apos;.
                </p>
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

            {/* Mode selection description */}
            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                <strong>Analysis Mode:</strong> {jobText.trim() ? 'Resume + Job Description Match' : 'General Resume ATS Check'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {jobText.trim()
                  ? 'Evaluates Keyword Match (25%), Skills Match (25%), Structure (15%), Formatting (15%), Contact (10%), Sections (10%).'
                  : 'Evaluates Structure (25%), Formatting (25%), Skills (20%), Contact (15%), Sections (15%).'}
              </p>
            </div>
          </div>

          {/* Optional Job Description Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiBriefcase /> Target Job Description (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Paste the job description text here to get keyword and skill matching scores..."
              value={jobText}
              onChange={e => setJobText(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            className="btn btn-primary"
            disabled={loading || resumes.length === 0}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Calculating ATS Compatibility...' : 'Calculate ATS Compatibility Score'}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && <Loader text="Evaluating resume structure, keywords, skills, and formatting..." />}

        {/* Results Section */}
        {atsResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="grid-2" style={{ gridTemplateColumns: '300px 1fr' }}>
              <ATSScoreCard score={atsResult.overallScore} />
              <ScoreBreakdown breakdown={atsResult.breakdown} hasJD={!!jobText.trim()} />
            </div>

            <div className="grid-2">
              <KeywordAnalysis
                matchedKeywords={atsResult.matchedKeywords}
                missingKeywords={atsResult.missingKeywords}
                matchedSkills={atsResult.matchedSkills}
                missingSkills={atsResult.missingSkills}
              />
              <FormattingAnalysis
                strengths={atsResult.strengths}
                weaknesses={atsResult.weaknesses}
                suggestions={atsResult.suggestions}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

