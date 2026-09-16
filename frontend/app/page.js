'use client';
import Link from 'next/link';
import {
  FiUpload,
  FiTarget,
  FiTrendingUp,
  FiFileText,
  FiLayers,
  FiMessageCircle,
  FiCheck,
  FiAlertTriangle,
  FiArrowRight,
  FiShield,
  FiCpu,
  FiCheckCircle
} from 'react-icons/fi';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero Section */}
      <section style={{
        padding: '72px 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Left Column: Hero Text */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-light)',
              marginBottom: '20px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
              Deterministic ATS Heuristics & Analysis Engine
            </div>

            <h1 style={{
              fontSize: '38px',
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '16px'
            }}>
              Engineering-grade resume optimization for competitive roles.
            </h1>

            <p style={{
              fontSize: '16px',
              color: 'var(--text-light)',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '520px'
            }}>
              Test your resume against 50+ enterprise ATS parsing rules, map keyword alignment against live job descriptions, and highlight missing technical qualifications before you apply.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link
                href="/sign-up"
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 600 }}
              >
                <span>Get Started Free</span>
                <FiArrowRight size={14} />
              </Link>
              <Link
                href="/sign-in"
                className="btn btn-outline"
                style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 500 }}
              >
                Sign In to Dashboard
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-light)' }}>
                <FiCheck size={14} style={{ color: 'var(--success)' }} />
                <span>Deterministic ATS scoring for Workday, Greenhouse, & Lever parsers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-light)' }}>
                <FiCheck size={14} style={{ color: 'var(--success)' }} />
                <span>Zero AI hallucinations on experience dates, titles, or contact info</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-light)' }}>
                <FiCheck size={14} style={{ color: 'var(--success)' }} />
                <span>Privacy-first analysis with no third-party data broker sharing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Product ATS Audit Inspector */}
          <div>
            <div className="card" style={{
              padding: 0,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)'
            }}>
              {/* Window Bar */}
              <div style={{
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  tiger_ats_audit.report
                </span>
                <span className="badge badge-success" style={{ fontSize: '10.5px', padding: '2px 6px' }}>
                  Validated
                </span>
              </div>

              {/* Inspector Content */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Target Position Match
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                      Staff Platform Engineer
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--success)' }}>
                      88
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-light)' }}>Keyword & Skill Density</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>24 / 25 pts</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '96%', background: 'var(--success)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-light)' }}>Layout & Parser Safety</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>15 / 15 pts</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '100%', background: 'var(--success)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-light)' }}>Section Header Completeness</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>14 / 15 pts</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '93%', background: 'var(--success)' }} />
                    </div>
                  </div>
                </div>

                {/* Heuristic Diagnostic Logs */}
                <div style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span> Standard chronological layout detected (Workday ready)
                  </div>
                  <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span> Contact info, email, & GitHub link cleanly extracted
                  </div>
                  <div style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>!</span> Missing target keyword: Kubernetes (found in JD requirements)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Practical Workflow */}
      <section style={{
        padding: '60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Workflow
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
            How TigerResume optimizes your application
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              01
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '0 0 8px 0' }}>
              Upload & Parse
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
              Upload your PDF or enter structured details. Our dual parser extracts work history, education, skills, and metrics into a normalized data model.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(22, 163, 74, 0.08)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              02
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '0 0 8px 0' }}>
              Target Job Alignment
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
              Paste any job description to evaluate keyword frequency, required tech stacks, and skill gaps with deterministic scoring.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(37, 99, 235, 0.08)',
              color: 'var(--info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              03
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '0 0 8px 0' }}>
              ATS-Proof Export
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
              Export clean, single-column PDF resumes formatted specifically to prevent character encoding errors and parser truncations.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Capabilities Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Platform Features
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
            Engineered for precision and parser compliance
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ padding: '22px' }}>
            <FiTarget size={20} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Deterministic ATS Heuristics
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>
              Tests document margins, standard header names, contact hyperlinks, and date formats against enterprise parsing standards.
            </p>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <FiTrendingUp size={20} style={{ color: 'var(--success)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Job Match & Skill Coverage
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>
              Calculates keyword match percentages and isolates missing technical competencies required by the hiring manager.
            </p>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <FiFileText size={20} style={{ color: 'var(--info)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Quantitative Bullet Enhancer
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>
              Refactors passive phrases into metric-backed impact statements highlighting business value and technical ownership.
            </p>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <FiLayers size={20} style={{ color: 'var(--warning)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Skill Gap Roadmapping
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>
              Identifies specific technologies and frameworks you need to acquire to become a competitive candidate for target jobs.
            </p>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <FiMessageCircle size={20} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Interactive Resume Chat
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>
              Discuss specific bullet points, mock interview questions, and role fit directly with an AI trained on your background.
            </p>
          </div>

          <div className="card" style={{ padding: '22px' }}>
            <FiShield size={20} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Privacy & Data Isolation
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.5, margin: 0 }}>
              Your professional data is private to your account. We never sell candidate resumes or share profiles with external recruiters.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
            Ready to test your resume against ATS filters?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '20px' }}>
            Upload your resume now to calculate your compatibility score and identify missing keywords.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link href="/sign-up" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '13.5px' }}>
              Create Free Account
            </Link>
            <Link href="/sign-in" className="btn btn-outline" style={{ padding: '9px 18px', fontSize: '13.5px' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Developer Footer */}
      <footer style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        padding: '24px 20px',
        fontSize: '12.5px',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>TigerResume</span>
            <span>•</span>
            <span>Enterprise Resume Optimization & ATS Scanner</span>
          </div>
          <div>
            © {new Date().getFullYear()} TigerResume. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
