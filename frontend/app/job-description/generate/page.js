'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';
import Loader from '../../../components/Loader';
import JobAnalysis from '../../../components/job/JobAnalysis';
import { useAuth } from '../../../hooks/useAuth';
import { generateJobDescriptionAI } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { FiCpu, FiArrowLeft, FiStar } from 'react-icons/fi';

import toast from 'react-hot-toast';

export default function JobDescriptionGeneratePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [skillsStr, setSkillsStr] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedJob, setGeneratedJob] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      toast.error('Job title is required');
      return;
    }

    setGenerating(true);
    setGeneratedJob(null);

    try {
      const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      const res = await generateJobDescriptionAI({
        jobTitle: jobTitle.trim(),
        experienceLevel,
        skills
      });

      if (res.data && res.data.available === false) {
        toast.error(res.data.message || 'AI sample generation unavailable');
      } else if (res.data && res.data.jobDescription) {
        toast.success('Sample job description generated!');
        setGeneratedJob(res.data.jobDescription);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate sample job description');
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
    return <Loader text="Loading Generator..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Generate Sample Job Description</h1>
            <p>Generate a realistic sample Job Description for practice and resume testing</p>
          </div>
          <Link href="/job-description" className="btn btn-outline">
            <FiArrowLeft /> Back to Job Descriptions
          </Link>
        </div>

        {/* Generator Form */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <form onSubmit={handleGenerate}>
            <div className="grid-3" style={{ marginBottom: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label>Target Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer / React Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value)}
                >
                  <option value="Entry Level">Entry Level (0-1 yrs)</option>
                  <option value="Associate">Associate (1-3 yrs)</option>
                  <option value="Mid Level">Mid Level (3-5 yrs)</option>
                  <option value="Senior Level">Senior Level (5+ yrs)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Focus Technical Skills (Comma-separated, optional)</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, Express, MongoDB, Tailwind"
                value={skillsStr}
                onChange={e => setSkillsStr(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={generating}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {generating ? 'Gemini AI is generating sample Job Description...' : '✨ Generate AI Sample Job Description'}
            </button>
          </form>
        </div>

        {/* Loading Indicator */}
        {generating && <Loader text="Generating requirements, skills, keywords, and responsibilities..." />}

        {/* Render Generated Result */}
        {generatedJob && (
          <div>
            <div className="card" style={{ marginBottom: '16px', padding: '12px 20px', background: 'rgba(202, 138, 4, 0.1)', borderColor: 'var(--warning)' }}>
              <p style={{ fontSize: '13px', color: 'var(--warning)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiStar /> Note: This is an <strong>AI-generated sample job description</strong> created for practice and matching. It has been automatically saved to your saved jobs list.
              </p>
            </div>

            <JobAnalysis jobDescription={generatedJob} />
          </div>
        )}
      </div>
    </div>
  );
}

