'use client';
import Sidebar from '../../components/Sidebar';
import Link from 'next/link';
import { FiLayout, FiCheckCircle } from 'react-icons/fi';

const TEMPLATES_LIST = [
  {
    id: 'classic',
    name: 'Classic Template',
    badge: '100% ATS Friendly',
    description: 'Clean single-column ATS-friendly layout with traditional typography, clear hierarchy, and optimal spacing.',
    features: ['Single-column ATS standard', 'Traditional typography', 'High readability', 'Print-ready A4']
  },
  {
    id: 'modern',
    name: 'Modern Template',
    badge: 'Professional & Sleek',
    description: 'Modern professional layout with subtle accent headers, left-bordered section titles, and clean spacing.',
    features: ['Strong visual hierarchy', 'Clean section dividers', 'Modern typography', 'Recruiter-tested']
  },
  {
    id: 'creative',
    name: 'Creative Template',
    badge: 'Distinctive Layout',
    description: 'Distinctive recruiter-friendly visual layout featuring styled section banners, tech badges, and bullet accents.',
    features: ['Styled header banner', 'Tech skill pills', 'Visually engaging', 'Software & Design focus']
  }
];

export default function TemplatesPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Resume Templates</h1>
          <p>Choose from ATS-friendly, professional Classic, Modern, and Creative resume layouts</p>
        </div>

        <div className="grid-3" style={{ gap: '24px' }}>
          {TEMPLATES_LIST.map(tmpl => (
            <div key={tmpl.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-info" style={{ fontSize: '11px' }}>{tmpl.badge}</span>
                  <FiLayout style={{ color: 'var(--primary)', fontSize: '20px' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text)' }}>
                  {tmpl.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {tmpl.description}
                </p>

                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 20px 0', fontSize: '12px', color: 'var(--text)' }}>
                  {tmpl.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <FiCheckCircle style={{ color: 'var(--success)', fontSize: '13px' }} /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/templates/${tmpl.id}`}
                className="btn btn-primary"
                style={{ textAlign: 'center', padding: '10px', fontSize: '13.5px', textDecoration: 'none' }}
              >
                Preview & Use Template
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

