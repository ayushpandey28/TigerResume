'use client';

export default function MissingKeywords({ matchedKeywords = [], missingKeywords = [] }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
        Keyword Coverage
      </h3>

      {/* Matched Keywords */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--info)', marginBottom: '8px' }}>
          ✓ Matched Keywords ({matchedKeywords.length})
        </h4>
        {matchedKeywords.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>No specific keyword alignment found.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matchedKeywords.map((kw, index) => (
              <span key={index} className="badge badge-info" style={{ fontSize: '12px' }}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)', marginBottom: '8px' }}>
            ⚠ Recommended Keywords to Incorporate ({missingKeywords.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missingKeywords.slice(0, 15).map((kw, index) => (
              <span key={index} className="badge badge-warning" style={{ fontSize: '12px' }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

