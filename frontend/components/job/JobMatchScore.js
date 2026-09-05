'use client';
import { getScoreColor, getScoreLabel } from '../../lib/formatters';

export default function JobMatchScore({ matchPercentage = 0, breakdown = {} }) {
  const color = getScoreColor(matchPercentage);
  const label = getScoreLabel(matchPercentage);

  const categories = [
    { label: 'Required Skills Match', score: breakdown.skills || 0, max: 35 },
    { label: 'Tech Keywords Match', score: breakdown.keywords || 0, max: 25 },
    { label: 'Experience Match', score: breakdown.experience || 0, max: 15 },
    { label: 'Education Match', score: breakdown.education || 0, max: 10 },
    { label: 'Project Relevance', score: breakdown.projects || 0, max: 15 }
  ];

  return (
    <div className="card" style={{ padding: '28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'center' }}>
        {/* Circle Gauge */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '12px' }}>
            Job Compatibility
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: `7px solid ${color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>
                {matchPercentage}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Match</span>
            </div>
          </div>
          <span
            className={`badge ${matchPercentage >= 75 ? 'badge-success' : matchPercentage >= 50 ? 'badge-warning' : 'badge-danger'}`}
            style={{
              fontSize: '13px',
              padding: '4px 12px',
              marginTop: '12px'
            }}
          >
            {label} Match
          </span>
        </div>

        {/* Category Breakdown Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categories.map((cat, i) => {
            const pct = Math.min(100, Math.round((cat.score / cat.max) * 100));
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  <span>{cat.label}</span>
                  <span>{cat.score} / {cat.max} pts</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

