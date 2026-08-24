'use client';

export default function MatchedSkills({ matchedSkills = [] }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', marginBottom: '16px' }}>
        ✓ Matched Skills ({matchedSkills.length})
      </h3>
      {matchedSkills.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
          No matching skills detected between resume and target job.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {matchedSkills.map((skill, index) => (
            <span key={index} className="badge badge-success" style={{ fontSize: '13px' }}>
              ✓ {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

