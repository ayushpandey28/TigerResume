'use client';

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px'
    }}>
      <div style={{
        maxWidth: '80%',
        display: 'flex',
        gap: '10px',
        flexDirection: isUser ? 'row-reverse' : 'row'
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isUser ? 'var(--primary)' : 'var(--accent)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          flexShrink: 0
        }}>
          {isUser ? 'You' : '🐯'}
        </div>

        {/* Message Content */}
        <div style={{
          background: isUser ? 'var(--primary)' : '#F1F5F9',
          color: isUser ? 'white' : 'var(--text)',
          padding: '12px 16px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: '14px',
          lineHeight: '1.6',
          boxShadow: 'var(--shadow-sm)',
          whiteSpace: 'pre-line'
        }}>
          {content}
        </div>
      </div>
    </div>
  );
}

