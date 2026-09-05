'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { useAuth } from '../../hooks/useAuth';
import { fetchUserHistory } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiClock, FiTarget, FiBarChart2, FiLayers, FiGithub, FiLinkedin, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FILTERS = [
  { id: 'all', label: 'All Activity' },
  { id: 'ats', label: 'ATS Analysis' },
  { id: 'job-match', label: 'Job Match' },
  { id: 'skill-gap', label: 'Skill Gap' },
  { id: 'github', label: 'GitHub' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'chat', label: 'AI Chat' }
];

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    } else if (user) {
      setLoading(true);
      fetchUserHistory(filter)
        .then(res => setItems(res.data || []))
        .catch(() => toast.error('Failed to load history items'))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, filter, router]);

  if (authLoading) {
    return <Loader text="Loading activity history..." />;
  }

  const getItemIcon = (type) => {
    switch (type) {
      case 'ats': return <FiTarget style={{ color: 'var(--primary)' }} />;
      case 'job-match': return <FiBarChart2 style={{ color: 'var(--success)' }} />;
      case 'skill-gap': return <FiLayers style={{ color: 'var(--info)' }} />;
      case 'github': return <FiGithub style={{ color: 'var(--text)' }} />;
      case 'linkedin': return <FiLinkedin style={{ color: '#0A66C2' }} />;
      case 'chat': return <FiMessageCircle style={{ color: 'var(--primary)' }} />;
      default: return <FiClock style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Activity History</h1>
          <p>Review past ATS analyses, Job Match evaluations, Skill Gap roadmaps, profile checks, and AI chat sessions</p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`btn ${filter === f.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader text="Fetching activity records..." />
        ) : items.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>📜</span>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '12px', color: 'var(--text)' }}>No activity found</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
              No history items available for filter '{filter}'. Perform an analysis to populate your history timeline.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {items.map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ fontSize: '20px', background: 'var(--bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {getItemIcon(item.type)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {item.score !== undefined && (
                    <span className="badge badge-info" style={{ fontSize: '12px', marginBottom: '4px', display: 'inline-block' }}>
                      {item.score}{item.type === 'job-match' || item.type === 'skill-gap' ? '%' : ' Score'}
                    </span>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

