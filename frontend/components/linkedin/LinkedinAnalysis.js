'use client';

export default function LinkedinAnalysis({ analysisData }) {
  if (!analysisData) return null;

  const { completeness = 0, headline, about, strengths = [], gaps = [], suggestions = [] } = analysisData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Completeness Gauge Card */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            LinkedIn Profile Completeness Score
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
            Evaluated based on headline, summary, skills, experience, and education clarity
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: completeness >= 75 ? 'var(--success)' : completeness >= 50 ? 'var(--warning)' : 'var(--danger)'
          }}>
            {completeness}%
          </div>
        </div>
      </div>

      {/* Review Details */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)' }}>
          📌 Profile Section Highlights
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
            Headline Review
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text)', background: 'var(--bg)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', margin: 0 }}>
            {headline && headline !== 'Not provided' ? headline : 'No headline entered for evaluation.'}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
            About Summary Review
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text)', background: 'var(--bg)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', margin: 0, whiteSpace: 'pre-line' }}>
            {about && about !== 'Not provided' ? about : 'No About summary entered for evaluation.'}
          </p>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid-2">
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', marginBottom: '12px' }}>
            ✓ Profile Strengths
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {strengths.map((str, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--danger)', marginBottom: '12px' }}>
            ⚠ Areas for Improvement
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {gaps.map((g, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>
            💡 Recommended LinkedIn Profile Enhancements
          </h3>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
            {suggestions.map((sug, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{sug}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

