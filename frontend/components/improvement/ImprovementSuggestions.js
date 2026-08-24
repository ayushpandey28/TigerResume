'use client';

export default function ImprovementSuggestions({ sectionImprovements = [], keywordSuggestions = [], overallSuggestions = [] }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
        Strategic Optimization Insights
      </h3>

      {overallSuggestions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
            💡 Overall Recommendations
          </h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {overallSuggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {keywordSuggestions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--info)', marginBottom: '8px' }}>
            🎯 Supported Keyword Alignments
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {keywordSuggestions.map((kw, i) => (
              <span key={i} className="badge badge-info" style={{ fontSize: '12px' }}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {sectionImprovements.length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            📌 Section-by-Section Guidance
          </h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-light)' }}>
            {sectionImprovements.map((sec, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{sec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

