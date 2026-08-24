'use client';
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
  return (
    <aside style={{
      width: 'var(--sidebar-width)', background: 'white', borderRight: '1px solid var(--border)',
      height: 'calc(100vh - var(--navbar-height))', position: 'fixed', top: 'var(--navbar-height)',
      left: 0, overflowY: 'auto', padding: '16px 0'
    }}>
      {menuItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px',
            fontSize: '14px', fontWeight: isActive ? 600 : 400,
            color: isActive ? 'var(--primary)' : 'var(--text-light)',
            background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
            borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
            textDecoration: 'none', transition: 'all 0.15s'
          }}>
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
