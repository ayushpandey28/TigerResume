'use client';

export default function Creative({ resume, customization = {} }) {
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
    default: '#7C3AED',
    blue: '#2563EB',
    green: '#059669',
    dark: '#0F172A'
  };
  const primaryColor = colorMap[customization.accentColor] || colorMap.default;

  return (
    <div style={{ background: '#FFFFFF', padding: '36px', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'Inter, system-ui, sans-serif', color: '#1E293B', lineHeight: '1.5' }}>
      {/* Header Banner */}
      <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: `1px solid ${primaryColor}22`, marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: primaryColor }}>
          {contact.name || resume.title || 'Untitled Candidate'}
        </h1>
        <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px 14px', wordBreak: 'break-word' }}>
          {contact.email && <span>📧 {contact.email}</span>}
          {contact.phone && <span>📱 {contact.phone}</span>}
          {contact.location && <span>📍 {contact.location}</span>}
          {contact.linkedin && <span>🌐 {contact.linkedin}</span>}
          {contact.github && <span>📦 {contact.github}</span>}
          {contact.website && <span>🔗 {contact.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚡</span> Professional Summary
          </h2>
          <p style={{ fontSize: '13px', margin: 0, color: '#334155' }}>{summary}</p>
        </div>
      )}

      {/* Skills */}
      {((skillCategories && skillCategories.length > 0) || (skills && skills.length > 0)) && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🛠</span> Core Competencies & Tech Stack
          </h2>
          {skillCategories && skillCategories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {skillCategories.map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: primaryColor, minWidth: '150px' }}>
                    {cat.name}:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {cat.skills.map((skill, idx) => (
                      <span key={idx} style={{ background: `${primaryColor}15`, color: primaryColor, fontSize: '11.5px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill, i) => (
                <span key={i} style={{ background: `${primaryColor}15`, color: primaryColor, fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '16px' }}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💼</span> Professional Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px', paddingLeft: '14px', borderLeft: `3px solid ${primaryColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700 }}>
                <span>{exp.title || 'Role'}</span>
                <span style={{ fontWeight: 500, color: '#64748B', fontSize: '12px' }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: primaryColor, marginBottom: '4px' }}>
                {exp.company} {exp.location ? `• ${exp.location}` : ''}
              </div>
              {exp.bullets && exp.bullets.length > 0 ? (
                <ul style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '13px', color: '#334155' }}>
                  {exp.bullets.map((b, idx) => (
                    <li key={idx} style={{ marginBottom: '3px' }}>{b}</li>
                  ))}
                </ul>
              ) : exp.description ? (
                <p style={{ fontSize: '13px', margin: 0, color: '#334155', whiteSpace: 'pre-line' }}>{exp.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🚀</span> Key Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '14px', paddingLeft: '14px', borderLeft: `3px solid ${primaryColor}44` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#0F172A' }}>{proj.name}</h3>
                {proj.link && (
                  <span style={{ fontSize: '11.5px', color: primaryColor, wordBreak: 'break-all', fontWeight: 500 }}>{proj.link}</span>
                )}
              </div>
              {proj.technologies && proj.technologies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0 6px 0' }}>
                  {(Array.isArray(proj.technologies) ? proj.technologies : String(proj.technologies).split(',')).map((tech, idx) => (
                    <span key={idx} style={{ fontSize: '11px', background: `${primaryColor}12`, color: primaryColor, padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                      {String(tech).trim()}
                    </span>
                  ))}
                </div>
              )}
              {proj.bullets && proj.bullets.length > 0 ? (
                <ul style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '13px', color: '#334155' }}>
                  {proj.bullets.map((bullet, idx) => (
                    <li key={idx} style={{ marginBottom: '3px' }}>{bullet}</li>
                  ))}
                </ul>
              ) : proj.description ? (
                <p style={{ fontSize: '13px', margin: 0, color: '#334155', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{proj.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎓</span> Education & Qualifications
          </h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                <span>{edu.degree || edu.details || 'Degree'}</span>
                <span style={{ fontWeight: 500, color: '#64748B', fontSize: '12px' }}>{edu.year}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span>{edu.institution}</span>
                {edu.cgpa && <span style={{ fontWeight: 600, color: primaryColor }}>CGPA: {edu.cgpa}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📜</span> Certifications
          </h2>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#334155' }}>
            {certifications.map((cert, i) => (
              <li key={i} style={{ marginBottom: '3px' }}>{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

