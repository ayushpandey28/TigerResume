'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardSummary } from '../../lib/api';
import {
  FiFileText,
  FiTarget,
  FiBarChart2,
  FiTrendingUp,
  FiLayers,
  FiMessageCircle,
  FiGrid,
  FiClock,
  FiActivity,
  FiArrowRight,
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';

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
    return <Loader text="Loading your TigerResume workspace..." />;
  }

  if (!user) return null;

  const { resume, latestATS, latestJobMatch, latestSkillGap, recentActivity = [] } = summary || {};

  const getAtsBadge = (score) => {
    if (score == null) return { label: 'Not Analyzed', className: 'badge-neutral' };
    if (score >= 80) return { label: 'Strong Match', className: 'badge-success' };
    if (score >= 60) return { label: 'Good Base', className: 'badge-warning' };
    return { label: 'Needs Polish', className: 'badge-danger' };
  };

  const atsBadge = latestATS ? getAtsBadge(latestATS.score) : { label: 'Pending Scan', className: 'badge-neutral' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        {/* Page Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-light)', margin: 0 }}>
              Resume optimization, ATS metrics, and match analytics for {user.name}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/resume" className="btn btn-outline" style={{ fontSize: '12.5px', padding: '6px 12px' }}>
              <FiFileText size={13} />
              <span>Resumes</span>
            </Link>
            <Link href="/ats" className="btn btn-primary" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
              <FiTarget size={13} />
              <span>New ATS Check</span>
            </Link>
          </div>
        </div>

        {/* Section 1: Active Resume Spotlight + Key Metric Strips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Active Resume Spotlight */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Resume
                </span>
                {resume ? (
                  <span className="badge badge-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    v{resume.version || resume.currentVersion || 1} Active
                  </span>
                ) : (
                  <span className="badge badge-warning" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    No Resume
                  </span>
                )}
              </div>

              {resume ? (
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px 0', wordBreak: 'break-word' }}>
                    {resume.title || resume.originalFileName || 'Untitled Resume'}
                  </h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-light)', margin: '0 0 16px 0' }}>
                    Last updated {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '8px 0 16px 0' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '0 0 6px 0' }}>
                    No resume uploaded yet. Add your resume to run ATS compatibility checks and job comparisons.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              {resume ? (
                <>
                  <Link href="/resume" className="btn btn-outline" style={{ flex: 1, fontSize: '12px', padding: '6px 10px', textAlign: 'center' }}>
                    Edit Document
                  </Link>
                  <Link href="/ats" className="btn btn-primary" style={{ flex: 1, fontSize: '12px', padding: '6px 10px', textAlign: 'center' }}>
                    Run ATS Scan
                  </Link>
                </>
              ) : (
                <Link href="/resume" className="btn btn-primary" style={{ width: '100%', fontSize: '12.5px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FiUpload size={13} />
                  <span>Upload Your First Resume</span>
                </Link>
              )}
            </div>
          </div>

          {/* Health Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {/* ATS Score Tile */}
            <Link href="/ats" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ATS Score
                    </span>
                    <FiTarget size={14} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: latestATS ? 'var(--text)' : 'var(--text-muted)', margin: '4px 0' }}>
                    {latestATS ? `${latestATS.score}` : '--'}
                    {latestATS && <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '2px' }}>/100</span>}
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span className={`badge ${atsBadge.className}`} style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                    {atsBadge.label}
                  </span>
                </div>
              </div>
            </Link>

            {/* Job Match Tile */}
            <Link href="/job-match" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Job Match
                    </span>
                    <FiBarChart2 size={14} style={{ color: 'var(--success)' }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: latestJobMatch ? 'var(--text)' : 'var(--text-muted)', margin: '4px 0' }}>
                    {latestJobMatch ? `${latestJobMatch.matchPercentage}%` : '--'}
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {latestJobMatch?.jobTitle ? latestJobMatch.jobTitle : 'Compare against JD'}
                  </span>
                </div>
              </div>
            </Link>

            {/* Skill Coverage Tile */}
            <Link href="/skill-gap" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Skill Coverage
                    </span>
                    <FiLayers size={14} style={{ color: 'var(--info)' }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: latestSkillGap ? 'var(--text)' : 'var(--text-muted)', margin: '4px 0' }}>
                    {latestSkillGap ? `${latestSkillGap.skillCoverage}%` : '--'}
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-light)' }}>
                    {latestSkillGap ? 'Calculated' : 'Identify missing skills'}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Section 2: Core Workflows (3 Distinct Action Cards) */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Optimization Workflows
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* ATS Workflow */}
            <Link href="/ats" style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                padding: '20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}>
                <div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px'
                  }}>
                    <FiTarget size={18} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px 0' }}>
                    ATS Compatibility Audit
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.5', margin: 0 }}>
                    Deterministic heuristics test formatting, section headers, contact completeness, and keyword parsing.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--primary)', marginTop: '16px' }}>
                  <span>Run audit</span>
                  <FiArrowRight size={13} />
                </div>
              </div>
            </Link>

            {/* Job Match Workflow */}
            <Link href="/job-match" style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                padding: '20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}>
                <div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(22, 163, 74, 0.08)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px'
                  }}>
                    <FiBarChart2 size={18} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px 0' }}>
                    Target Job Matcher
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.5', margin: 0 }}>
                    Align your resume against specific target postings to expose missing keywords and qualifications.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--success)', marginTop: '16px' }}>
                  <span>Compare posting</span>
                  <FiArrowRight size={13} />
                </div>
              </div>
            </Link>

            {/* AI Resume Enhancer Workflow */}
            <Link href="/resume/improve" style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                padding: '20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}>
                <div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(37, 99, 235, 0.08)',
                    color: 'var(--info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px'
                  }}>
                    <FiTrendingUp size={18} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px 0' }}>
                    AI Content Enhancer
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.5', margin: 0 }}>
                    Strengthen action verbs, quantify achievements, and eliminate passive voice across your bullet points.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--info)', marginTop: '16px' }}>
                  <span>Optimize content</span>
                  <FiArrowRight size={13} />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Section 3: Split Row - Utilities & Chronological Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Quick Tools List */}
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Workspace Tools
            </h2>
            <div className="card" style={{ padding: '8px' }}>
              <Link href="/ask-resume" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.15s ease'
                }} className="table-row-hover">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiMessageCircle size={16} style={{ color: 'var(--text-light)' }} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Ask Resume AI</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Interactive Q&A for interview preparation & gap analysis</div>
                    </div>
                  </div>
                  <FiArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>

              <Link href="/skill-gap" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.15s ease'
                }} className="table-row-hover">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiLayers size={16} style={{ color: 'var(--text-light)' }} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Skill Gap Breakdown</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Map missing qualifications into structured learning paths</div>
                    </div>
                  </div>
                  <FiArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>

              <Link href="/templates" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.15s ease'
                }} className="table-row-hover">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiGrid size={16} style={{ color: 'var(--text-light)' }} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>ATS Templates</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pre-formatted, single-column ATS compliant layouts</div>
                    </div>
                  </div>
                  <FiArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>

              <Link href="/history" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.15s ease'
                }} className="table-row-hover">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiClock size={16} style={{ color: 'var(--text-light)' }} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Activity History</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Historical logs across all analyses and versions</div>
                    </div>
                  </div>
                  <FiArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Recent Activity
              </h2>
              <Link href="/history" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                View all logs
              </Link>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              {recentActivity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <FiActivity size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '0 0 4px 0' }}>No activity recorded yet</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Your ATS audits, job matches, and resume versions will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentActivity.slice(0, 5).map((act, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'var(--bg)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          flexShrink: 0
                        }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {act.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '12px' }}>
                        {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


