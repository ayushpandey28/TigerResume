'use client';
import { getScoreColor, getScoreLabel } from '../../lib/formatters';

export default function ATSScoreCard({ score = 0 }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '16px' }}>
        ATS Compatibility Estimate
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <div style={{
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: `8px solid ${color}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)' }}>
            {score}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>

      <span
        className={`badge ${score >= 75 ? 'badge-success' : score >= 50 ? 'badge-warning' : 'badge-danger'}`}
        style={{
          fontSize: '14px',
          padding: '6px 16px',
          marginTop: '8px'
        }}
      >
        {label}
      </span>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
        Calculated using deterministic heuristics for keyword match, skills alignment, structure, formatting, and contact details.
      </p>
    </div>
  );
}

