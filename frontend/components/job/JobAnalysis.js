'use client';

export default function JobAnalysis({ jobDescription }) {
  if (!jobDescription) return null;

  const {
    title,
    company,
    description,
    requiredSkills = [],
    preferredSkills = [],
    keywords = [],
    responsibilities = [],
    experience = 'Not specified',
    education = 'Not specified',
    isAIGenerated = false
  } = jobDescription;

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
          {company && <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>{company}</p>}
        </div>
        {isAIGenerated && (
          <span className="badge badge-warning" style={{ fontSize: '12px' }}>
            🤖 AI-Generated Sample
          </span>
        )}
      </div>

      {description && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Overview</h4>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
            {description}
          </p>
        </div>
      )}

      {/* Required Skills */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
          Required Skills ({requiredSkills.length})
        </h4>
        {requiredSkills.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not analyzed yet or none specified.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {requiredSkills.map((sk, i) => (
              <span key={i} className="badge badge-primary">{sk}</span>
            ))}
          </div>
        )}
      </div>

      {/* Preferred Skills */}
      {preferredSkills.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--info)', marginBottom: '8px' }}>
            Preferred / Nice-to-Have Skills ({preferredSkills.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {preferredSkills.map((sk, i) => (
              <span key={i} className="badge badge-info">{sk}</span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)', marginBottom: '8px' }}>
            Extracted Tech Keywords ({keywords.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {keywords.map((kw, i) => (
              <span key={i} className="badge badge-success" style={{ fontSize: '11px' }}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            Key Responsibilities
          </h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.5' }}>
            {responsibilities.map((resp, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{resp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements Metadata */}
      <div className="grid-2" style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
        <div>
          <strong>Experience Required:</strong> {experience}
        </div>
        <div>
          <strong>Education Required:</strong> {education}
        </div>
      </div>
    </div>
  );
}

