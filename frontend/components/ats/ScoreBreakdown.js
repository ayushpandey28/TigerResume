'use client';

export default function ScoreBreakdown({ breakdown = {}, hasJD = false }) {
  const items = hasJD ? [
    { label: 'Keyword Match', score: breakdown.keywordMatch || 0, max: 25 },
    { label: 'Skills Match', score: breakdown.skillsMatch || 0, max: 25 },
    { label: 'Resume Structure', score: breakdown.structure || 0, max: 15 },
    { label: 'Formatting & ATS Safety', score: breakdown.formatting || 0, max: 15 },
    { label: 'Contact Information', score: breakdown.contact || 0, max: 10 },
    { label: 'Section Completeness', score: breakdown.sections || 0, max: 10 }
  ] : [
    { label: 'Resume Structure', score: breakdown.structure || 0, max: 25 },
    { label: 'Formatting & ATS Safety', score: breakdown.formatting || 0, max: 25 },
    { label: 'Skills Completeness', score: breakdown.skillsMatch || 0, max: 20 },
    { label: 'Contact Information', score: breakdown.contact || 0, max: 15 },
    { label: 'Section Completeness', score: breakdown.sections || 0, max: 15 }
  ];

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
        Score Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, index) => {
          const percent = Math.min(100, Math.round((item.score / item.max) * 100));
          return (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                <span>{item.label}</span>
                <span>{item.score} / {item.max} pts</span>
              </div>
              <div style={{
                height: '8px',
                width: '100%',
                background: 'var(--border)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: percent >= 75 ? 'var(--success)' : percent >= 50 ? 'var(--warning)' : 'var(--danger)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

