'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardSummary } from '../../lib/api';
import { FiFileText, FiTarget, FiBarChart2, FiTrendingUp, FiLayers, FiMessageCircle, FiGrid, FiClock, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

const actions = [
  { href: '/resume', icon: <FiFileText size={22} />, title: 'My Resume', desc: 'Upload and manage your resumes' },
  { href: '/ats', icon: <FiTarget size={22} />, title: 'ATS Score', desc: 'Check your ATS compatibility score' },
  { href: '/job-match', icon: <FiBarChart2 size={22} />, title: 'Job Match', desc: 'Match resume against job descriptions' },
  { href: '/resume/improve', icon: <FiTrendingUp size={22} />, title: 'Improve Resume', desc: 'Get AI-powered optimization suggestions' },
  { href: '/skill-gap', icon: <FiLayers size={22} />, title: 'Skill Gap', desc: 'Identify missing skills for target jobs' },
  { href: '/ask-resume', icon: <FiMessageCircle size={22} />, title: 'Ask AI', desc: 'Chat with AI about your resume' },
  { href: '/templates', icon: <FiGrid size={22} />, title: 'Templates', desc: 'Choose ATS-friendly resume templates' },
  { href: '/history', icon: <FiClock size={22} />, title: 'Activity History', desc: 'View past analyses and sessions' }
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    } else if (user) {
      fetchDashboardSummary()
        .then(res => setSummary(res.data))
        .catch(() => toast.error('Failed to load dashboard summary'))
        .finally(() => setDataLoading(false));
    }
  }, [authLoading, user, router]);

  if (authLoading || dataLoading) {
    return <Loader text="Loading your TigerResume dashboard..." />;
  }

  if (!user) return null;

  const { resume, latestATS, latestJobMatch, latestSkillGap, recentActivity = [] } = summary || {};

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Welcome back, {user.name} 👋</h1>
          <p>Your AI-powered resume optimization and job compatibility center</p>
        </div>

        {/* Real Metrics Row */}
        <div className="grid-4" style={{ gap: '16px', marginBottom: '28px' }}>
          {/* Active Resume Metric */}
          <div className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Active Resume</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '6px 0 2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {resume ? resume.title : 'No Resume'}
            </div>
            <span style={{ fontSize: '12px', color: resume ? 'var(--primary)' : 'var(--danger)', fontWeight: 500 }}>
              {resume ? `Active Version v${resume.version}` : 'Upload a resume to begin'}
            </span>
          </div>

          {/* ATS Metric */}
          <div className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>ATS Score</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: latestATS ? 'var(--primary)' : 'var(--text-muted)', margin: '4px 0 2px 0' }}>
              {latestATS ? `${latestATS.score}/100` : 'Not analyzed'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
              {latestATS ? `Last checked ${new Date(latestATS.createdAt).toLocaleDateString()}` : 'Run ATS check'}
            </span>
          </div>

          {/* Job Match Metric */}
          <div className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Job Match</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: latestJobMatch ? 'var(--success)' : 'var(--text-muted)', margin: '4px 0 2px 0' }}>
              {latestJobMatch ? `${latestJobMatch.matchPercentage}%` : 'Not analyzed'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
              {latestJobMatch ? latestJobMatch.jobTitle : 'Compare against a job'}
            </span>
          </div>

          {/* Skill Coverage Metric */}
          <div className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Skill Coverage</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: latestSkillGap ? 'var(--info)' : 'var(--text-muted)', margin: '4px 0 2px 0' }}>
              {latestSkillGap ? `${latestSkillGap.skillCoverage}%` : 'Not analyzed'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
              {latestSkillGap ? 'Required skills' : 'Run skill gap analysis'}
            </span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)' }}>
          Quick Actions
        </h3>
        <div className="grid-4" style={{ gap: '16px', marginBottom: '32px' }}>
          {actions.map((a, i) => (
            <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', height: '100%' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '10px' }}>{a.icon}</div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--text)' }}>{a.title}</h4>
                <p style={{ color: 'var(--text-light)', fontSize: '12px', margin: 0 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity Stream */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiActivity style={{ color: 'var(--primary)' }} /> Recent Activity
          </h3>

          {recentActivity.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>No recent activity recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((act, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>
                    {act.title}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


