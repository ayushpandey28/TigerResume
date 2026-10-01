'use client';
import { FiUser, FiCpu } from 'react-icons/fi';
//....
export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '18px'
    }}>
      <div style={{
        maxWidth: '82%',
        display: 'flex',
        gap: '12px',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start'
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: isUser ? 'var(--primary)' : 'var(--secondary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {isUser ? <FiUser /> : <FiCpu />}
        </div>
        <div style={{
          background: isUser ? 'var(--primary)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border)',
          color: isUser ? 'white' : 'var(--text)',
          padding: '12px 18px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          fontSize: '13.5px',
          lineHeight: '1.65',
          boxShadow: isUser ? '0 2px 4px rgba(249, 115, 22, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
          whiteSpace: 'pre-line'
        }}>
          {content}
        </div>
      </div>
    </div>
  );
}

