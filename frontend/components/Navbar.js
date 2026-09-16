'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut } from 'react-icons/fi';

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

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar-container" style={{
      height: 'var(--navbar-height)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
      transition: 'background-color 0.15s ease, border-color 0.15s ease',
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
              fontSize: '20px',
              color: 'var(--text)',
              display: 'none', // Managed by responsive CSS in globals.css
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        )}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '-0.02em',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            TR
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Tiger<span style={{ color: 'var(--primary)' }}>Resume</span>
          </span>
        </Link>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-light)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {theme === 'dark' ? <FiSun size={13} style={{ color: '#F59E0B' }} /> : <FiMoon size={13} style={{ color: '#6366F1' }} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {user ? (
          <>
            <Link href="/dashboard" style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-light)',
              textDecoration: 'none',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap'
            }}>
              Dashboard
            </Link>
            <Link href="/profile" style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap',
              padding: '3px 8px 3px 4px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg)'
            }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {userInitial}
              </div>
              <span className="nav-user-name" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </span>
            </Link>
            <button
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Sign out"
            >
              <FiLogOut size={12} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              style={{
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
