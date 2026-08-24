export default function ErrorMessage({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px', borderColor: 'var(--danger)' }}>
      <p style={{ color: 'var(--danger)', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>⚠️ Error</p>
      <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>{message}</p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try Again</button>}
    </div>
  );
}
