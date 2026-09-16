'use client';
import { FiCheckCircle, FiAlertTriangle, FiArrowUpRight } from 'react-icons/fi';

export default function FormattingAnalysis({ strengths = [], weaknesses = [], suggestions = [], formattingIssues = [] }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
        ATS Formatting & Recommendations
      </h3>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--success)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiCheckCircle size={15} /> Verified Strengths
          </h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {strengths.map((str, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{str}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiAlertTriangle size={15} /> Formatting & Content Flags
          </h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {weaknesses.map((w, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiArrowUpRight size={15} /> Actionable Recommendations
          </h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
            {suggestions.map((sug, i) => (
              <li key={i} style={{ marginBottom: '6px', lineHeight: '1.5' }}>{sug}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

