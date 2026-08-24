'use client';

export default function KeywordAnalysis({ matchedKeywords = [], missingKeywords = [], matchedSkills = [], missingSkills = [] }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
        Keyword & Skill Alignment
      </h3>

      {/* Matched Skills */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)', marginBottom: '10px' }}>
          ✓ Matched Skills ({matchedSkills.length})
        </h4>
        {matchedSkills.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>No specific skill matches detected.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {matchedSkills.map((skill, i) => (
              <span key={i} className="badge badge-success">
                ✓ {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)', marginBottom: '10px' }}>
            ✗ Missing Skills ({missingSkills.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {missingSkills.map((skill, i) => (
              <span key={i} className="badge badge-danger">
                ✗ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matched Keywords */}
      {matchedKeywords.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--info)', marginBottom: '10px' }}>
            ✓ Matched Keywords ({matchedKeywords.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matchedKeywords.slice(0, 15).map((kw, i) => (
              <span key={i} className="badge badge-info" style={{ fontSize: '11px' }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--warning)', marginBottom: '10px' }}>
            ⚠ Recommended Keywords ({missingKeywords.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missingKeywords.slice(0, 15).map((kw, i) => (
              <span key={i} className="badge badge-warning" style={{ fontSize: '11px' }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

