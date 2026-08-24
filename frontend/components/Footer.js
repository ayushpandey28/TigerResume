export default function Footer() {
  return (
    <footer style={{ background: 'var(--secondary)', color: 'var(--text-muted)', padding: '20px 24px', textAlign: 'center', fontSize: '14px' }}>
      © {new Date().getFullYear()} TigerResume. AI-powered resume optimization.
    </footer>
  );
}
