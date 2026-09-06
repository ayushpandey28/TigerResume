'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUser, FiFileText, FiTarget, FiBarChart2, FiTrendingUp, FiLayers, FiBriefcase, FiGithub, FiLinkedin, FiMessageCircle, FiGrid, FiClock } from 'react-icons/fi';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { href: '/profile', label: 'My Profile', icon: <FiUser /> },
  { href: '/resume', label: 'My Resume', icon: <FiFileText /> },
  { href: '/ats', label: 'ATS Score', icon: <FiTarget /> },
  { href: '/job-match', label: 'Job Match', icon: <FiBarChart2 /> },
  { href: '/resume/improve', label: 'Resume Improve', icon: <FiTrendingUp /> },
  { href: '/skill-gap', label: 'Skill Gap', icon: <FiLayers /> },
  { href: '/job-description', label: 'Job Description', icon: <FiBriefcase /> },
  { href: '/github', label: 'GitHub Analysis', icon: <FiGithub /> },
  { href: '/linkedin', label: 'LinkedIn Analysis', icon: <FiLinkedin /> },
  { href: '/ask-resume', label: 'Ask Resume', icon: <FiMessageCircle /> },
  { href: '/templates', label: 'Templates', icon: <FiGrid /> },
  { href: '/history', label: 'History', icon: <FiClock /> }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = (e) => {
      setMobileOpen(typeof e.detail === 'boolean' ? e.detail : !mobileOpen);
    };

    window.addEventListener('tiger-toggle-sidebar', handleToggle);
    return () => window.removeEventListener('tiger-toggle-sidebar', handleToggle);
  }, [mobileOpen]);

  const closeSidebar = () => {
    setMobileOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tiger-close-sidebar'));
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={closeSidebar}
          className="sidebar-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 190,
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      <aside
        className={`app-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          height: 'calc(100vh - var(--navbar-height))',
          position: 'fixed',
          top: 'var(--navbar-height)',
          left: 0,
          overflowY: 'auto',
          padding: '16px 0',
          zIndex: 200,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease'
        }}
      >
        {menuItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary)' : 'var(--text-light)',
                background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
                borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </aside>
    </>
  );
}
