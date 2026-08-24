'use client';
import { useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import TemplateRenderer from '../../../components/templates/TemplateRenderer';
import { useResume } from '../../../hooks/useResume';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

const SAMPLE_RESUME = {
  title: 'Sample Developer Resume',
  contact: {
    name: 'Ayush Pandey',
    email: 'ayush@example.com',
    phone: '+91 9876543210',
    location: 'New Delhi, India',
    linkedin: 'linkedin.com/in/ayushpandey',
    github: 'github.com/ayushpandey'
  },
  summary: 'Results-driven Full-Stack Engineer with 3+ years of experience building scalable web applications with React, Node.js, and MongoDB.',
  skills: ['JavaScript', 'React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'],
  experience: [
    {
      title: 'Software Engineer',
      company: 'TechCorp Solutions',
      location: 'New Delhi',
      duration: '2023 - Present',
      description: 'Built high-throughput REST APIs and user-facing dashboards using React and Express.js.'
    }
  ],
  projects: [
    {
      name: 'TigerResume',
      description: 'AI-powered resume optimization & ATS-friendly career platform.'
    }
  ],
  education: [
    {
      degree: 'B.Tech in Computer Science',
      institution: 'Delhi Technological University',
      year: '2023'
    }
  ],
  certifications: ['AWS Certified Developer Associate']
};

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { activeResume, resumes, loadResumes } = useResume();

  const templateId = (params?.templateId || '').toLowerCase();
  const validTemplates = ['classic', 'modern', 'creative'];

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  if (!validTemplates.includes(templateId)) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Invalid Template Selected</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
              The requested template template '{templateId}' does not exist.
            </p>
            <Link href="/templates" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Back to Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const previewData = activeResume || (resumes.length > 0 ? resumes[0] : SAMPLE_RESUME);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/templates" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', textDecoration: 'none', fontSize: '14px' }}>
            <FiArrowLeft /> Back to All Templates
          </Link>

          <button
            onClick={() => router.push('/resume/download')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiCheck /> Use This Template for PDF Export
          </button>
        </div>

        <div className="page-header" style={{ marginBottom: '20px' }}>
          <h1 style={{ textTransform: 'capitalize' }}>{templateId} Template Preview</h1>
          <p>Live preview of your resume formatted in {templateId} layout</p>
        </div>

        {/* Template Render Container */}
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <TemplateRenderer
            templateId={templateId}
            resume={previewData}
          />
        </div>
      </div>
    </div>
  );
}

