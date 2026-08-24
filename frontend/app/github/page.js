'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import GithubAnalysis from '../../components/github/GithubAnalysis';
import { useAuth } from '../../hooks/useAuth';
import { analyzeGithubAPI } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiGithub } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function GitHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error('Please enter a GitHub username or profile URL');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await analyzeGithubAPI(input.trim());
      setAnalysisResult(res.data?.analysis || res.data);
      toast.success('GitHub profile analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze GitHub profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader text="Loading GitHub Profile Engine..." />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>GitHub Profile Analysis</h1>
          <p>Evaluate your GitHub public profile, top languages, repository showcase quality, and portfolio insights</p>
        </div>

        {/* Input Card */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <form onSubmit={handleAnalyze}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                <FiGithub style={{ color: 'var(--primary)' }} /> Enter GitHub Username or Profile URL
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. octocat or https://github.com/octocat"
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '6px' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {loading ? 'Fetching & Analyzing Public GitHub Data...' : 'Analyze GitHub Profile'}
            </button>
          </form>
        </div>

        {loading && <Loader text="Retrieving public repositories, language statistics, and star metrics..." />}

        {analysisResult && <GithubAnalysis analysisData={analysisResult} />}
      </div>
    </div>
  );
}

