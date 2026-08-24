'use client';

export default function SkillGap({
  skillCoverage = 0,
  existingSkills = [],
  matchedRequiredSkills = [],
  missingRequiredSkills = [],
  matchedPreferredSkills = [],
  missingPreferredSkills = [],
  gaps = []
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Skill Coverage Score */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Required Skill Coverage
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
            {matchedRequiredSkills.length} of {(matchedRequiredSkills.length + missingRequiredSkills.length)} required skills matched
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: skillCoverage >= 75 ? 'var(--success)' : skillCoverage >= 50 ? 'var(--warning)' : 'var(--danger)'
          }}>
            {skillCoverage}%
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Existing / Matched Skills */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', marginBottom: '16px' }}>
            ✓ Verified Matched Skills ({matchedRequiredSkills.length + matchedPreferredSkills.length})
          </h3>
          {matchedRequiredSkills.length === 0 && matchedPreferredSkills.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>No overlapping skills found.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {matchedRequiredSkills.map((s, i) => (
                <span key={`req-${i}`} className="badge badge-success" style={{ fontSize: '13px' }}>
                  ✓ {s} (Required)
                </span>
              ))}
              {matchedPreferredSkills.map((s, i) => (
                <span key={`pref-${i}`} className="badge badge-info" style={{ fontSize: '13px' }}>
                  ✓ {s} (Bonus)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills & Priority */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--danger)', marginBottom: '16px' }}>
            ⚠ Identified Skill Gaps ({gaps.length})
          </h3>
          {gaps.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--success)' }}>Awesome! Zero missing skills detected.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gaps.map((gap, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {gap.skill} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({gap.type})</span>
                  </span>
                  <span className="badge" style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    background: gap.priority === 'high' ? '#FEE2E2' : gap.priority === 'medium' ? '#FEF3C7' : '#E2E8F0',
                    color: gap.priority === 'high' ? '#991B1B' : gap.priority === 'medium' ? '#92400E' : '#475569'
                  }}>
                    {gap.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

