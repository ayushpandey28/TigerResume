export default function Loader({ size = 40, text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px' }}>
      <div style={{
        width: size, height: size, border: '4px solid var(--border)', borderTopColor: 'var(--primary)',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite'
      }} />
      {text && <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>{text}</p>}
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
