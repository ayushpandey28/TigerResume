'use client';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      height: 'var(--navbar-height)', background: 'white', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow)'
    }}>
      <Link href="/" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', textDecoration: 'none' }}>
        🐯 Tiger<span style={{ color: 'var(--primary)' }}>Resume</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <Link href="/profile" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              👤 {user.name}
            </Link>
            <Link href="/dashboard" style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Dashboard</Link>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '13px' }}>Logout</button>

          </>
        ) : (
          <>
            <Link href="/sign-in" style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: 500 }}>Sign In</Link>
            <Link href="/sign-up" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

