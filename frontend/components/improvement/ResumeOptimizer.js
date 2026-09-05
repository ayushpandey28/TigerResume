'use client';
import { useEffect, useState } from 'react';
import BeforeAfter from './BeforeAfter';
import ImprovementSuggestions from './ImprovementSuggestions';
import Loader from '../Loader';
import { useResume } from '../../hooks/useResume';
import { fetchJobDescriptions, analyzeResumeImprovement, applyResumeImprovement } from '../../lib/api';
import { FiZap, FiCheck, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ResumeOptimizer() {
  const { resumes, activeResume, loadResumes, loadResumeById } = useResume();

  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [improvements, setImprovements] = useState(null);
  const [acceptedState, setAcceptedState] = useState({
    summary: true,
    experience: {},
    projects: {}
  });

  useEffect(() => {
    loadResumes();
    fetchJobDescriptions()
      .then(res => setJobs(res.data || []))
      .catch(() => toast.error('Failed to load target job descriptions'));
  }, [loadResumes]);

  useEffect(() => {
    if (activeResume && !selectedResumeId) {
      setSelectedResumeId(activeResume._id);
    } else if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0]._id);
    }
  }, [activeResume, resumes, selectedResumeId]);

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume to optimize');
      return;
    }

    setLoading(true);
    setImprovements(null);

    try {
      const res = await analyzeResumeImprovement({
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId || undefined
      });

      if (res.data && res.data.available === false) {
        toast.error(res.data.message || 'AI service unavailable');
      } else if (res.data && res.data.improvements) {
        setImprovements(res.data);
        // Initialize all items as accepted by default
        const expAccepted = {};
        (res.data.improvements.experience || []).forEach((_, i) => expAccepted[i] = true);
        const projAccepted = {};
        (res.data.improvements.projects || []).forEach((_, i) => projAccepted[i] = true);

        setAcceptedState({
          summary: true,
          experience: expAccepted,
          projects: projAccepted
        });

        toast.success('AI Resume Optimization analysis complete!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze improvements');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!improvements || !selectedResumeId) return;

    setApplying(true);

    try {
      const currentResume = resumes.find(r => r._id === selectedResumeId) || activeResume;
      const impData = improvements.improvements;

      // Construct accepted payload
      const acceptedSummary = acceptedState.summary && impData.summary?.improved
        ? impData.summary.improved
        : currentResume?.summary;

      const acceptedExp = (currentResume?.experience || []).map((expItem, idx) => {
        if (acceptedState.experience[idx] && impData.experience?.[idx]?.improved) {
          return { ...expItem, description: impData.experience[idx].improved };
        }
        return expItem;
      });

      const acceptedProj = (currentResume?.projects || []).map((projItem, idx) => {
        if (acceptedState.projects[idx] && impData.projects?.[idx]?.improved) {
          return { ...projItem, description: impData.projects[idx].improved };
        }
        return projItem;
      });

      const payload = {
        resumeId: selectedResumeId,
        originalVersion: improvements.originalVersion || 1,
        acceptedChanges: {
          summary: acceptedSummary,
          experience: acceptedExp,
          projects: acceptedProj
        }
      };

      const res = await applyResumeImprovement(payload);
      toast.success(`Optimizations applied! Version ${res.data.newVersion} created.`);
      await loadResumes();
      await loadResumeById(selectedResumeId);
      setImprovements(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply optimizations');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      {/* Control Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiZap style={{ color: 'var(--primary)' }} /> AI Resume Improvement Settings
        </h3>

        <div className="grid-2" style={{ marginBottom: '20px' }}>
          <div>
            <label>Select Resume *</label>
            {resumes.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--danger)' }}>No resumes uploaded yet.</p>
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
            <label>Target Job Description (Optional)</label>
            <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
              <option value="">-- General Professional Optimization --</option>
              {jobs.map(j => (
                <option key={j._id} value={j._id}>
                  {j.title} {j.company ? `(${j.company})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          className="btn btn-primary"
          disabled={loading || resumes.length === 0}
          style={{ width: '100%', padding: '12px', fontSize: '15px' }}
        >
          {loading ? 'Gemini AI is analyzing improvements...' : '✨ Run AI Resume Optimization'}
        </button>
      </div>

      {loading && <Loader text="Formulating action verbs, conciseness, and job-aligned bullets..." />}

      {/* Improvements Review */}
      {improvements && improvements.improvements && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '16px 24px', background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 500 }}>
              Review proposed changes below. Check the items you want to keep before applying.
            </span>
            <button
              onClick={handleApply}
              className="btn btn-primary"
              disabled={applying}
              style={{ padding: '8px 18px', fontSize: '14px' }}
            >
              {applying ? 'Applying & Creating Version...' : '✓ Apply Accepted Changes (Create New Version)'}
            </button>
          </div>

          <ImprovementSuggestions
            sectionImprovements={improvements.improvements.section_improvements}
            keywordSuggestions={improvements.improvements.keyword_suggestions}
            overallSuggestions={improvements.improvements.overall_suggestions}
          />

          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginTop: '8px' }}>
            Before & After Line Comparisons
          </h3>

          {/* Summary Comparison */}
          {improvements.improvements.summary && (
            <BeforeAfter
              title="Professional Summary"
              original={improvements.improvements.summary.original}
              improved={improvements.improvements.summary.improved}
              reason={improvements.improvements.summary.reason}
              isAccepted={acceptedState.summary}
              onToggle={val => setAcceptedState(prev => ({ ...prev, summary: val }))}
            />
          )}

          {/* Experience Comparison */}
          {improvements.improvements.experience?.map((exp, i) => (
            <BeforeAfter
              key={`exp-${i}`}
              title={`Work Experience Item #${i + 1}`}
              original={exp.original}
              improved={exp.improved}
              reason={exp.reason}
              isAccepted={!!acceptedState.experience[i]}
              onToggle={val => setAcceptedState(prev => ({
                ...prev,
                experience: { ...prev.experience, [i]: val }
              }))}
            />
          ))}

          {/* Projects Comparison */}
          {improvements.improvements.projects?.map((proj, i) => (
            <BeforeAfter
              key={`proj-${i}`}
              title={`Project Description Item #${i + 1}`}
              original={proj.original}
              improved={proj.improved}
              reason={proj.reason}
              isAccepted={!!acceptedState.projects[i]}
              onToggle={val => setAcceptedState(prev => ({
                ...prev,
                projects: { ...prev.projects, [i]: val }
              }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

