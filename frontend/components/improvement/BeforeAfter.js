'use client';

export default function BeforeAfter({ title, original, improved, reason, isAccepted = true, onToggle }) {
  if (!original && !improved) return null;

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: isAccepted ? '4px solid var(--success)' : '4px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{title}</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: isAccepted ? 'var(--success)' : 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={isAccepted}
            onChange={(e) => onToggle && onToggle(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
          />
          {isAccepted ? '✓ Change Accepted' : 'Skip Change'}
        </label>
      </div>

      <div className="grid-2" style={{ gap: '16px', marginBottom: '12px' }}>
        {/* Before */}
        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Before (Original)</span>
          <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '4px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
            {original || '—'}
          </p>
        </div>

        {/* After */}
        <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>After (AI Improved)</span>
          <p style={{ fontSize: '13px', color: '#14532D', marginTop: '4px', lineHeight: '1.5', whiteSpace: 'pre-line', fontWeight: 500 }}>
            {improved || '—'}
          </p>
        </div>
      </div>

      {reason && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
          💡 <strong>Rationale:</strong> {reason}
        </p>
      )}
    </div>
  );
}

