import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorMessage({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '36px 24px', borderColor: 'var(--danger)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <FiAlertCircle size={28} style={{ color: 'var(--danger)' }} />
      </div>
      <p style={{ color: 'var(--danger)', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Error</p>
      <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '16px' }}>{message}</p>
      {onRetry && <button className="btn btn-outline" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={onRetry}>Try Again</button>}
    </div>
  );
}
