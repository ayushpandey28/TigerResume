'use client';
import Link from 'next/link';
import { FiUpload, FiTarget, FiTrendingUp, FiFileText, FiGitBranch, FiMessageCircle } from 'react-icons/fi';

const features = [
  { icon: <FiUpload size={28} />, title: 'Resume Upload', desc: 'Upload your PDF resume and get instant structured parsing' },
  { icon: <FiTarget size={28} />, title: 'ATS Scoring', desc: 'Get an ATS-style compatibility score with detailed breakdown' },
  { icon: <FiTrendingUp size={28} />, title: 'Job Matching', desc: 'Compare your resume against any job description' },
  { icon: <FiFileText size={28} />, title: 'AI Optimization', desc: 'Get AI-powered suggestions to improve your resume' },
  { icon: <FiGitBranch size={28} />, title: 'Skill Gap Analysis', desc: 'Identify missing skills and get a learning roadmap' },
  { icon: <FiMessageCircle size={28} />, title: 'Ask Resume AI', desc: 'Chat with AI about your resume and job fit' }
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <section style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: 'white', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>
          🐯 Tiger<span style={{ color: '#F97316' }}>Resume</span>
        </h1>
        <p style={{ fontSize: '20px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 32px' }}>
          AI-powered resume optimization platform. Analyze, match, and improve your resume for any job.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/sign-up" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>Get Started Free</Link>
          <Link href="/sign-in" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '16px', borderColor: 'white', color: 'white' }}>Sign In</Link>
        </div>
      </section>

      <section style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>How It Works</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '15px', color: 'var(--text-light)' }}>
          <span className="badge badge-info">Upload Resume</span><span>→</span>
          <span className="badge badge-info">Add Job Description</span><span>→</span>
          <span className="badge badge-warning">ATS Score + Match</span><span>→</span>
          <span className="badge badge-success">AI Optimization</span><span>→</span>
          <span className="badge badge-success">Improved Resume</span>
        </div>
      </section>

      <section style={{ padding: '40px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '32px', textAlign: 'center' }}>Features</h2>
        <div className="grid-3">
          {features.map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: 'var(--secondary)', color: 'var(--text-muted)', padding: '24px', textAlign: 'center', fontSize: '14px' }}>
        © 2026 TigerResume. Built for job seekers who want an edge.
      </footer>
    </div>
  );
}
