'use client';
import { FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiFileText } from 'react-icons/fi';

export default function LinkedinAnalysis({ analysisData }) {
  if (!analysisData) return null;

  const { completeness = 0, headline, about, strengths = [], gaps = [], suggestions = [] } = analysisData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Completeness Gauge Card */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            LinkedIn Profile Completeness Score
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
            Evaluated based on headline, summary, skills, experience, and education clarity
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: completeness >= 75 ? 'var(--success)' : completeness >= 50 ? 'var(--warning)' : 'var(--danger)'
          }}>
            {completeness}%
          </div>
        </div>
      </div>

      {/* Review Details */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiFileText size={15} style={{ color: 'var(--primary)' }} /> Profile Section Highlights
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
            Headline Review
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text)', background: 'var(--bg)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', margin: 0 }}>
            {headline && headline !== 'Not provided' ? headline : 'No headline entered for evaluation.'}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
            About Summary Review
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text)', background: 'var(--bg)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', margin: 0, whiteSpace: 'pre-line' }}>
            {about && about !== 'Not provided' ? about : 'No About summary entered for evaluation.'}
          </p>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid-2" style={{ gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiCheckCircle size={15} /> Profile Strengths
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {strengths.map((str, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiAlertTriangle size={15} /> Areas for Improvement
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
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiTrendingUp size={15} /> Recommended LinkedIn Profile Enhancements
          </h3>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
            {suggestions.map((sug, i) => {
              if (typeof sug === 'string') {
                return <li key={i} style={{ marginBottom: '6px' }}>{sug}</li>;
              }
              return (
                <li key={i} style={{ marginBottom: '10px' }}>
                  {sug?.priority && (
                    <span className={`badge ${sug.priority === 'High' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '11px', marginRight: '6px' }}>
                      {sug.priority}
                    </span>
                  )}
                  {sug?.area && <strong style={{ marginRight: '6px' }}>[{sug.area}]:</strong>}
                  <span>{sug?.suggestion || JSON.stringify(sug)}</span>
                  {sug?.reason && (
                    <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                      <em>Reason:</em> {sug.reason}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* AI Deep Analysis (if available) */}
      {analysisData.aiAnalysis && (
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: 'var(--primary)' }}>
            Gemini AI Deep Profile Insights
          </h3>
          {analysisData.aiAnalysis.overallAssessment?.summary && (
            <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: '1.6', marginBottom: '16px' }}>
              {analysisData.aiAnalysis.overallAssessment.summary}
            </p>
          )}

          {analysisData.aiAnalysis.headlineAnalysis?.recommendedImprovement && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '12.5px', color: 'var(--primary)' }}>Suggested Headline:</strong>
              <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: 'var(--text)' }}>
                {analysisData.aiAnalysis.headlineAnalysis.recommendedImprovement}
              </p>
            </div>
          )}

          {analysisData.aiAnalysis.skillsAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginTop: '12px' }}>
              {analysisData.aiAnalysis.skillsAnalysis.strongSkills?.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--success)' }}>Strong Skills: </strong>
                  <span>{analysisData.aiAnalysis.skillsAnalysis.strongSkills.join(', ')}</span>
                </div>
              )}
              {analysisData.aiAnalysis.skillsAnalysis.skillsToHighlight?.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--info)' }}>Skills to Promote: </strong>
                  <span>{analysisData.aiAnalysis.skillsAnalysis.skillsToHighlight.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

