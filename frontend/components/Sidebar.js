'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUser, FiFileText, FiTarget, FiBarChart2, FiTrendingUp, FiLayers, FiBriefcase, FiGithub, FiLinkedin, FiMessageCircle, FiGrid, FiClock } from 'react-icons/fi';

const menuSections = [
  {
    title: 'WORKSPACE',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <FiHome size={16} /> },
      { href: '/resume', label: 'My Resume', icon: <FiFileText size={16} /> },
      { href: '/job-description', label: 'Job Descriptions', icon: <FiBriefcase size={16} /> }
    ]
  },
  {
    title: 'ANALYSIS',
    items: [
      { href: '/ats', label: 'ATS Score', icon: <FiTarget size={16} /> },
      { href: '/job-match', label: 'Job Match', icon: <FiBarChart2 size={16} /> },
      { href: '/resume/improve', label: 'Resume Improve', icon: <FiTrendingUp size={16} /> },
      { href: '/skill-gap', label: 'Skill Gap', icon: <FiLayers size={16} /> }
    ]
  },
  {
    title: 'PROFILE',
    items: [
      { href: '/profile', label: 'My Profile', icon: <FiUser size={16} /> },
      { href: '/github', label: 'GitHub Analysis', icon: <FiGithub size={16} /> },
      { href: '/linkedin', label: 'LinkedIn Analysis', icon: <FiLinkedin size={16} /> }
    ]
  },
  {
    title: 'TOOLS',
    items: [
      { href: '/ask-resume', label: 'Ask Resume AI', icon: <FiMessageCircle size={16} /> },
      { href: '/templates', label: 'Templates', icon: <FiGrid size={16} /> },
      { href: '/history', label: 'History', icon: <FiClock size={16} /> }
    ]
  }
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
            zIndex: 190
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
          padding: '12px 0 24px 0',
          zIndex: 200,
          transition: 'transform 0.2s ease, background-color 0.15s ease, border-color 0.15s ease'
        }}
      >
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '12px' }}>
            <div
              style={{
                padding: '8px 20px 4px 20px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em'
              }}
            >
              {section.title}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '7px 12px',
                      margin: '1px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--primary)' : 'var(--text-light)',
                      background: isActive ? 'var(--primary-subtle)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease, color 0.15s ease'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>
    </>
  );
}
