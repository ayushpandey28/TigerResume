'use client';
import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import { sendChatMessage, getChatHistory, createNewChat } from '../../lib/api';
import { FiSend, FiTrash2, FiMessageSquare, FiCornerDownLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'What are the strongest skills highlighted in my resume?',
  'What should I improve in my project descriptions?',
  'Is my resume suitable for a frontend developer role?',
  'Which skills am I missing for this target job?',
  'What are the biggest weaknesses in my resume?'
];

export default function ChatBox({ resumeId, jobDescriptionId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (resumeId) {
      setFetchingHistory(true);
      getChatHistory(resumeId)
        .then(res => {
          setMessages(res.data?.messages || []);
        })
        .catch(() => {
          setMessages([]);
        })
        .finally(() => {
          setFetchingHistory(false);
        });
    }
  }, [resumeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || !resumeId) return;

    const userText = text.trim();
    setInputMessage('');
    setLoading(true);

    // Optimistic user message addition
    setMessages(prev => [...prev, { role: 'user', content: userText }]);

    try {
      const res = await sendChatMessage({
        resumeId,
        jobDescriptionId: jobDescriptionId || undefined,
        message: userText
      });

      if (res.data && res.data.available === false) {
        toast.error(res.data.message || 'AI assistant is unavailable');
        setMessages(prev => [...prev, { role: 'assistant', content: 'AI assistant is currently unavailable. Please try again later.' }]);
      } else if (res.data && res.data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI assistant error');
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI assistant is temporarily unavailable. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!resumeId) return;
    try {
      await createNewChat(resumeId);
      setMessages([]);
      toast.success('Chat history reset');
    } catch (err) {
      toast.error('Failed to clear chat');
    }
  };

  return (
    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '620px' }}>
      {/* Chat Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiMessageSquare style={{ color: 'var(--primary)', fontSize: '18px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
            Ask Resume AI Assistant
          </h3>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', borderColor: '#FEE2E2' }}
          >
            <FiTrash2 /> Reset Chat
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#FFFFFF' }}>
        {fetchingHistory ? (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>Loading chat history...</p>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <span style={{ fontSize: '40px' }}>💬</span>
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginTop: '12px', color: 'var(--text)' }}>
              Ask anything about your resume
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>
              Select a suggested prompt below or type your own question.
            </p>

            {/* Suggested Question Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="badge"
                  style={{
                    background: '#F1F5F9',
                    color: 'var(--primary)',
                    border: '1px solid var(--border)',
                    padding: '8px 14px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderRadius: '20px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--primary)', fontStyle: 'italic', margin: '12px 0' }}>
            <span>🐯 Thinking & analyzing resume context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Controls */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: '#FAFAFA' }}>
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Type a question about your resume..."
            disabled={loading || !resumeId}
            style={{ flex: 1, padding: '12px 16px', fontSize: '14px', borderRadius: '8px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !inputMessage.trim() || !resumeId}
            style={{ padding: '12px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiSend /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

