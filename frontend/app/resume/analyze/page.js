'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Loader from '../../../components/Loader';
import { useResume } from '../../../hooks/useResume';
import { useAuth } from '../../../hooks/useAuth';
import { analyzeResumeAI } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { FiCpu, FiCheckCircle, FiAlertTriangle, FiCode, FiBriefcase, FiFolder, FiFileText, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ResumeAnalyzePage() {
  const { resumes, activeResume, loadResumes } = useResume();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [unavailableMsg, setUnavailableMsg] = useState('');

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
      toast.error('Please select a resume');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setAiUnavailable(false);

    try {
      const res = await analyzeResumeAI(selectedResumeId);
      if (res.data && res.data.available === false) {
        setAiUnavailable(true);
        setUnavailableMsg(res.data.message || 'AI service is currently unavailable.');
      } else if (res.data && res.data.analysis) {
        setAnalysisResult(res.data.analysis);
        toast.success('AI Resume analysis complete!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI analysis failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader text="Loading Resume Analysis..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>AI Resume Analysis</h1>
          <p>Get qualitative semantic feedback and actionable career insights powered by Gemini AI</p>
        </div>

        {/* Configuration Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCpu style={{ color: 'var(--primary)' }} /> Select Resume to Analyze
          </h3>

          <div style={{ marginBottom: '16px' }}>
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

          <button
            onClick={handleAnalyze}
            className="btn btn-primary"
            disabled={loading || resumes.length === 0}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Gemini AI is analyzing your resume...' : 'Run AI Resume Analysis'}
          </button>
        </div>

        {/* AI Unavailable Banner */}
        {aiUnavailable && (
          <div className="card" style={{ padding: '24px', borderColor: 'var(--warning)', background: 'rgba(202, 138, 4, 0.1)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--warning)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAlertTriangle /> AI Analysis Unavailable
            </h3>
            <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '12px' }}>{unavailableMsg}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
              Tip: You can still calculate your rule-based ATS Compatibility Score under <strong>ATS Score</strong> without requiring Gemini API credentials.
            </p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && <Loader text="Evaluating resume structure, skills context, and professional presentation..." />}

        {/* Analysis Results View */}
        {analysisResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Overall Assessment */}
            <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--primary)' }}>
                Overall Assessment
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>
                {analysisResult.overall_assessment}
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid-2">
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheckCircle /> Key Strengths
                </h3>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
                  {analysisResult.strengths?.map((s, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--warning)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiAlertTriangle /> Areas to Improve
                </h3>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
                  {analysisResult.weaknesses?.map((w, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skill Analysis */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCode style={{ color: 'var(--primary)' }} /> Skill Depth Analysis
              </h3>
              <div className="grid-3">
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)', marginBottom: '8px' }}>Strong Skills (Supported)</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysisResult.skills_analysis?.strong_skills?.map((sk, i) => (
                      <span key={i} className="badge badge-success" style={{ fontSize: '12px' }}>{sk}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--info)', marginBottom: '8px' }}>Skills to Highlight</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysisResult.skills_analysis?.skills_to_highlight?.map((sk, i) => (
                      <span key={i} className="badge badge-info" style={{ fontSize: '12px' }}>{sk}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)', marginBottom: '8px' }}>Skills Needing Context</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysisResult.skills_analysis?.skills_that_need_context?.map((sk, i) => (
                      <span key={i} className="badge badge-warning" style={{ fontSize: '12px' }}>{sk}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Feedback */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiFileText style={{ color: 'var(--primary)' }} /> Section Feedback
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                {analysisResult.section_feedback?.summary && (
                  <div><strong>Summary:</strong> <span style={{ color: 'var(--text-light)' }}>{analysisResult.section_feedback.summary}</span></div>
                )}
                {analysisResult.section_feedback?.skills && (
                  <div><strong>Skills:</strong> <span style={{ color: 'var(--text-light)' }}>{analysisResult.section_feedback.skills}</span></div>
                )}
                {analysisResult.section_feedback?.projects && (
                  <div><strong>Projects:</strong> <span style={{ color: 'var(--text-light)' }}>{analysisResult.section_feedback.projects}</span></div>
                )}
                {analysisResult.section_feedback?.experience && (
                  <div><strong>Experience:</strong> <span style={{ color: 'var(--text-light)' }}>{analysisResult.section_feedback.experience}</span></div>
                )}
                {analysisResult.section_feedback?.education && (
                  <div><strong>Education:</strong> <span style={{ color: 'var(--text-light)' }}>{analysisResult.section_feedback.education}</span></div>
                )}
              </div>
            </div>

            {/* Top Actionable Suggestions */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiZap style={{ color: 'var(--primary)' }} /> Actionable Recommendations
              </h3>
              <ol style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>
                {analysisResult.suggestions?.map((sug, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{sug}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

