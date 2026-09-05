'use client';

export default function GithubAnalysis({ analysisData }) {
  if (!analysisData || !analysisData.profile) return null;

  const { profile, metrics, repositories = [], strengths = [], gaps = [], suggestions = [] } = analysisData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Overview Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--primary)' }}
            />
          )}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
              {profile.name} <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 400 }}>({profile.username})</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 12px 0' }}>
              {profile.bio || 'No public bio set on GitHub'}
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
              <span>📦 <strong>{profile.publicRepos}</strong> Repositories</span>
              <span>👥 <strong>{profile.followers}</strong> Followers</span>
              <span>⭐ <strong>{metrics?.totalStars || 0}</strong> Stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Languages */}
      {metrics?.topLanguages?.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--primary)' }}>
            💻 Primary Languages & Tech Stack
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {metrics.topLanguages.map((lang, index) => (
              <span key={index} className="badge badge-info" style={{ fontSize: '13px', padding: '6px 14px' }}>
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Showcase Repositories */}
      {repositories.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)' }}>
            📂 Recent Showcase Repositories ({repositories.length})
          </h3>
          <div className="grid-2" style={{ gap: '16px' }}>
            {repositories.slice(0, 6).map((repo, idx) => (
              <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', background: 'var(--bg)' }}>
                <a href={repo.url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                  {repo.name} ↗
                </a>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: '6px 0', minHeight: '32px' }}>
                  {repo.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>● {repo.language}</span>
                  <span>⭐ {repo.stars} | 🍴 {repo.forks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Gaps */}
      <div className="grid-2">
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', marginBottom: '12px' }}>
            ✓ Profile Strengths
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {strengths.map((str, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--danger)', marginBottom: '12px' }}>
            ⚠ Profile Gaps & Areas to Improve
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {gaps.map((g, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>
            🚀 Portfolio Optimization Suggestions
          </h3>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
            {suggestions.map((sug, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{sug}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

