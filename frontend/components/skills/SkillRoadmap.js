'use client';

export default function SkillRoadmap({ roadmap = [] }) {
  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--success)',
            marginBottom: '8px'
          }}
        >
          🎉 Zero Learning Skill Gaps
        </h3>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-light)',
            margin: 0
          }}
        >
          Your resume already covers all required and preferred skills for this role!
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '20px',
          color: 'var(--primary)'
        }}
      >
        🗺️ Recommended Learning Roadmap
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {roadmap.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              background: 'var(--bg-card)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  {index + 1}
                </span>

                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    margin: 0
                  }}
                >
                  {item.skill}
                </h4>
              </div>

              <span
                className={`badge ${item.priority === 'high' ? 'badge-danger' : item.priority === 'medium' ? 'badge-warning' : ''}`}
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  ...(item.priority !== 'high' && item.priority !== 'medium' ? { background: 'var(--border)', color: 'var(--text-light)' } : {})
                }}
              >
                {item.priority} Priority
              </span>
            </div>

            <ol
              style={{
                paddingLeft: '24px',
                margin: 0,
                fontSize: '13px',
                color: 'var(--text-light)',
                lineHeight: '1.6'
              }}
            >
              {item.steps?.map((step, sIdx) => (
                <li
                  key={sIdx}
                  style={{
                    marginBottom: '4px'
                  }}
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}