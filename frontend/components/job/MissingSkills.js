'use client';

export default function MissingSkills({ missingSkills = [], missingPreferredSkills = [] }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
        Skill Gaps
      </h3>

      {/* Missing Required Skills */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px' }}>
          ✗ Missing Required Skills ({missingSkills.length})
        </h4>
        {missingSkills.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--success)' }}>Great job! You have all required skills.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {missingSkills.map((skill, index) => (
              <span key={index} className="badge badge-danger" style={{ fontSize: '13px' }}>
                ✗ {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Preferred Skills */}
      {missingPreferredSkills.length > 0 && (
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)', marginBottom: '8px' }}>
            ○ Missing Preferred Skills ({missingPreferredSkills.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {missingPreferredSkills.map((skill, index) => (
              <span key={index} className="badge badge-warning" style={{ fontSize: '12px' }}>
                ○ {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

