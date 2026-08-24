'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import LinkedinAnalysis from '../../components/linkedin/LinkedinAnalysis';
import { useAuth } from '../../hooks/useAuth';
import { analyzeLinkedinAPI } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiLinkedin } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LinkedInPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    profileUrl: '',
    headline: '',
    about: '',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profileUrl.trim()) {
      toast.error('Please enter a LinkedIn profile URL');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        profileUrl: formData.profileUrl.trim(),
        headline: formData.headline.trim(),
        about: formData.about.trim(),
        skills: skillsArray
      };

      const res = await analyzeLinkedinAPI(payload);
      setAnalysisResult(res.data?.analysis || res.data);
      toast.success('LinkedIn profile analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader text="Loading LinkedIn Profile Engine..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>LinkedIn Profile Analysis</h1>
          <p>Get actionable suggestions to improve your LinkedIn headline, About summary, and profile completeness</p>
        </div>

        {/* Input Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                <FiLinkedin style={{ color: '#0A66C2' }} /> LinkedIn Profile URL *
              </label>
              <input
                type="text"
                value={formData.profileUrl}
                onChange={e => setFormData({ ...formData, profileUrl: e.target.value })}
                placeholder="https://www.linkedin.com/in/your-username/"
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '6px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>Current LinkedIn Headline (Optional)</label>
              <input
                type="text"
                value={formData.headline}
                onChange={e => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Software Engineer at TechCorp | React & Node.js"
                disabled={loading}
                style={{ width: '100%', padding: '10px', fontSize: '13px', marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>About Summary (Optional)</label>
              <textarea
                rows={3}
                value={formData.about}
                onChange={e => setFormData({ ...formData, about: e.target.value })}
                placeholder="Paste your LinkedIn About summary..."
                disabled={loading}
                style={{ width: '100%', padding: '10px', fontSize: '13px', marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Skills Listed on LinkedIn (Comma-separated, Optional)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, JavaScript, Node.js, REST APIs, MongoDB"
                disabled={loading}
                style={{ width: '100%', padding: '10px', fontSize: '13px', marginTop: '4px' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.profileUrl.trim()}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {loading ? 'Evaluating LinkedIn Profile Data...' : 'Analyze LinkedIn Profile'}
            </button>
          </form>
        </div>

        {loading && <Loader text="Evaluating profile completeness, headline clarity, and summary impact..." />}

        {analysisResult && <LinkedinAnalysis analysisData={analysisResult} />}
      </div>
    </div>
  );
}

