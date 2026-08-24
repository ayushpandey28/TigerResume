'use client';

export default function Classic({ resume, customization = {} }) {
  if (!resume) return null;

  const { contact = {}, summary = '', skills = [], education = [], experience = [], projects = [], certifications = [] } = resume;

  const colorMap = {
    default: '#1E293B',
    blue: '#1E3A8A',
    green: '#065F46',
    dark: '#0F172A'
  };
  const primaryColor = colorMap[customization.accentColor] || colorMap.default;

  return (
    <div style={{ background: '#FFFFFF', padding: '36px', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'Arial, sans-serif', color: '#1E293B', lineHeight: '1.5' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #CBD5E1', paddingBottom: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: primaryColor }}>
          {contact.name || resume.title || 'Untitled Candidate'}
        </h1>
        <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
          {contact.linkedin && <span>{contact.linkedin}</span>}
          {contact.github && <span>{contact.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '13px', margin: 0, color: '#334155' }}>{summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            Skills
          </h2>
          <p style={{ fontSize: '13px', margin: 0, color: '#334155' }}>{skills.join('  •  ')}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '10px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            Work Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                <span>{exp.title || 'Role'}</span>
                <span style={{ fontWeight: 400, color: '#64748B' }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#475569', marginBottom: '4px' }}>
                {exp.company} {exp.location ? `• ${exp.location}` : ''}
              </div>
              {exp.description && <p style={{ fontSize: '12.5px', margin: 0, color: '#334155', whiteSpace: 'pre-line' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '10px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{proj.name}</div>
              {proj.description && <p style={{ fontSize: '12.5px', margin: 0, color: '#334155' }}>{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                <span>{edu.degree || edu.details || 'Degree'}</span>
                <span style={{ fontWeight: 400, color: '#64748B' }}>{edu.year}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>{edu.institution}</div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            Certifications
          </h2>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: '#334155' }}>
            {certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

