'use client';

export default function Classic({ resume, customization = {} }) {
  if (!resume) return null;

  const {
    contact = {},
    summary = '',
    skills = [],
    skillCategories = [],
    education = [],
    experience = [],
    projects = [],
    certifications = []
  } = resume;

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
        <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px 16px', wordBreak: 'break-word' }}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
          {contact.linkedin && <span>{contact.linkedin}</span>}
          {contact.github && <span>{contact.github}</span>}
          {contact.website && <span>{contact.website}</span>}
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
      {((skillCategories && skillCategories.length > 0) || (skills && skills.length > 0)) && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
            Skills
          </h2>
          {skillCategories && skillCategories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {skillCategories.map((cat, i) => (
                <div key={i} style={{ fontSize: '13px', color: '#334155' }}>
                  <strong style={{ color: primaryColor }}>{cat.name}: </strong>
                  <span>{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', margin: 0, color: '#334155' }}>{skills.join('  •  ')}</p>
          )}
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
              {exp.bullets && exp.bullets.length > 0 ? (
                <ul style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '12.5px', color: '#334155' }}>
                  {exp.bullets.map((b, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{b}</li>
                  ))}
                </ul>
              ) : exp.description ? (
                <p style={{ fontSize: '12.5px', margin: 0, color: '#334155', whiteSpace: 'pre-line' }}>{exp.description}</p>
              ) : null}
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
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{proj.name}</span>
                {proj.link && (
                  <span style={{ fontSize: '11px', color: '#64748B', wordBreak: 'break-all' }}>{proj.link}</span>
                )}
              </div>
              {proj.technologies && proj.technologies.length > 0 && (
                <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#475569', margin: '2px 0 4px 0' }}>
                  Technologies: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                </div>
              )}
              {proj.bullets && proj.bullets.length > 0 ? (
                <ul style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '12.5px', color: '#334155' }}>
                  {proj.bullets.map((bullet, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{bullet}</li>
                  ))}
                </ul>
              ) : proj.description ? (
                <p style={{ fontSize: '12.5px', margin: 0, color: '#334155', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{proj.description}</p>
              ) : null}
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
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span>{edu.institution}</span>
                {edu.cgpa && <span style={{ fontWeight: 600 }}>CGPA: {edu.cgpa}</span>}
              </div>
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
              <li key={i} style={{ marginBottom: '2px' }}>{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

