'use client';

export default function Modern({ resume, customization = {} }) {
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
    default: '#2563EB',
    blue: '#1D4ED8',
    green: '#059669',
    dark: '#1E293B'
  };
  const primaryColor = colorMap[customization.accentColor] || colorMap.default;

  return (
    <div style={{ background: '#FFFFFF', padding: '36px', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'Inter, system-ui, sans-serif', color: '#1F2937', lineHeight: '1.5' }}>
      {/* Header Banner */}
      <div style={{ borderLeft: `4px solid ${primaryColor}`, paddingLeft: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: primaryColor, letterSpacing: '-0.5px' }}>
          {contact.name || resume.title || 'Untitled Candidate'}
        </h1>
        <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontWeight: 500, wordBreak: 'break-word' }}>
          {contact.email && <span>✉ {contact.email}</span>}
          {contact.phone && <span>📞 {contact.phone}</span>}
          {contact.location && <span>📍 {contact.location}</span>}
          {contact.linkedin && <span>🔗 {contact.linkedin}</span>}
          {contact.github && <span>💻 {contact.github}</span>}
          {contact.website && <span>🌐 {contact.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '8px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', letterSpacing: '0.5px' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '13.5px', margin: 0, color: '#374151' }}>{summary}</p>
        </div>
      )}

      {/* Skills */}
      {((skillCategories && skillCategories.length > 0) || (skills && skills.length > 0)) && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '10px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', letterSpacing: '0.5px' }}>
            Skills
          </h2>
          {skillCategories && skillCategories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {skillCategories.map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px 10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', minWidth: '150px' }}>
                    {cat.name}:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {cat.skills.map((skill, idx) => (
                      <span key={idx} style={{ background: '#EFF6FF', color: primaryColor, fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.map((skill, i) => (
                <span key={i} style={{ background: '#EFF6FF', color: primaryColor, fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px' }}>
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
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '12px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', letterSpacing: '0.5px' }}>
            Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#111827' }}>{exp.title || 'Role'}</h3>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: primaryColor, marginBottom: '4px' }}>
                {exp.company} {exp.location ? `| ${exp.location}` : ''}
              </div>
              {exp.bullets && exp.bullets.length > 0 ? (
                <ul style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '13px', color: '#374151' }}>
                  {exp.bullets.map((b, idx) => (
                    <li key={idx} style={{ marginBottom: '3px' }}>{b}</li>
                  ))}
                </ul>
              ) : exp.description ? (
                <p style={{ fontSize: '13px', margin: 0, color: '#374151', whiteSpace: 'pre-line' }}>{exp.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '12px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', letterSpacing: '0.5px' }}>
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#111827' }}>{proj.name}</h3>
                {proj.link && (
                  <span style={{ fontSize: '11.5px', color: primaryColor, wordBreak: 'break-all', fontWeight: 500 }}>{proj.link}</span>
                )}
              </div>
              {proj.technologies && proj.technologies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0 6px 0' }}>
                  {(Array.isArray(proj.technologies) ? proj.technologies : String(proj.technologies).split(',')).map((tech, idx) => (
                    <span key={idx} style={{ fontSize: '11px', background: '#F3F4F6', color: '#4B5563', padding: '2px 6px', borderRadius: '3px', fontWeight: 500 }}>
                      {String(tech).trim()}
                    </span>
                  ))}
                </div>
              )}
              {proj.bullets && proj.bullets.length > 0 ? (
                <ul style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '13px', color: '#374151' }}>
                  {proj.bullets.map((bullet, idx) => (
                    <li key={idx} style={{ marginBottom: '3px' }}>{bullet}</li>
                  ))}
                </ul>
              ) : proj.description ? (
                <p style={{ fontSize: '13px', margin: 0, color: '#374151', whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>{proj.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '10px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', letterSpacing: '0.5px' }}>
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700 }}>
                <span>{edu.degree || edu.details || 'Degree'}</span>
                <span style={{ fontWeight: 500, color: '#6B7280', fontSize: '12px' }}>{edu.year}</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#4B5563', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
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
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: '8px', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '4px', letterSpacing: '0.5px' }}>
            Certifications
          </h2>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#374151' }}>
            {certifications.map((cert, i) => (
              <li key={i} style={{ marginBottom: '3px' }}>{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

