'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(currentTheme);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('tiger_resume_theme', nextTheme);
    } catch (e) {}
  };

  const toggleSidebar = () => {
    const nextState = !mobileMenuOpen;
    setMobileMenuOpen(nextState);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tiger-toggle-sidebar', { detail: nextState }));
    }
  };

  useEffect(() => {
    const handleClose = () => setMobileMenuOpen(false);
    window.addEventListener('tiger-close-sidebar', handleClose);
    return () => window.removeEventListener('tiger-close-sidebar', handleClose);
  }, []);

  return (
    <nav className="navbar-container" style={{
      height: 'var(--navbar-height)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow)',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
      maxWidth: '100%',
      overflowX: 'clip'
    }}>
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Menu"
            className="mobile-menu-btn"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '22px',
              color: 'var(--text)',
              display: 'none', // Shown via CSS media query
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        )}
        <Link href="/" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          🐯 Tiger<span style={{ color: 'var(--primary)' }}>Resume</span>
        </Link>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {theme === 'dark' ? <FiSun style={{ color: '#FBBF24' }} /> : <FiMoon style={{ color: '#6366F1' }} />}
          <span style={{ display: 'inline' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {user ? (
          <>
            <Link href="/profile" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              👤 <span className="nav-user-name">{user.name}</span>
            </Link>
            <Link href="/dashboard" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-light)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Dashboard
            </Link>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '12px' }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/sign-in" style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 500 }}>Sign In</Link>
            <Link href="/sign-up" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
