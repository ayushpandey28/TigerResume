const assert = require('assert');
const pdfService = require('./src/services/resume/pdfService');
const { normalizeResumeData } = require('./src/utils/resumeNormalizer');

async function runPdfProductionFontsTestSuite() {
  console.log('=== RUNNING TIGERRESUME PRODUCTION PDF & FONT REGRESSION TEST SUITE ===\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) {
        console.error(`    Stack: ${err.stack.split('\n').slice(1, 4).join('\n')}`);
      }
    }
  }

  // --- TEST 1: PDFKit Standard Font Files Resolution ---
  await test('Verify PDFKit standard font package subpaths exist and resolve via Node file resolution', async () => {
    const fontsToTest = [
      'pdfkit/standard-fonts/Helvetica',
      'pdfkit/standard-fonts/HelveticaBold',
      'pdfkit/standard-fonts/HelveticaOblique',
      'pdfkit/standard-fonts/HelveticaBoldOblique',
      'pdfkit/standard-fonts/TimesRoman',
      'pdfkit/standard-fonts/Courier'
    ];

    for (const fontSubpath of fontsToTest) {
      const resolved = require.resolve(fontSubpath);
      assert.ok(resolved, `Font subpath ${fontSubpath} should resolve`);
      const loaded = require(fontSubpath);
      assert.ok(loaded, `Font subpath ${fontSubpath} should load as CJS module`);
    }
  });

  const onePageResume = normalizeResumeData({
    contact: {
      name: 'Ayush Pandey',
      email: 'ayush@example.com',
      phone: '+91-8299560054',
      location: 'Ghaziabad, India',
      linkedin: 'linkedin.com/in/ayushpandey',
      github: 'github.com/ayushpandey'
    },
    summary: 'B.Tech CSE student skilled in React and Node.js.',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    experience: [{
      title: 'Frontend Developer Intern',
      company: 'Acme Technologies',
      location: 'Remote',
      startDate: '2023',
      endDate: '2024',
      bullets: ['Developed modern web interface components', 'Optimized bundle rendering performance']
    }],
    education: [{
      institution: 'KIET Group of Institutions',
      degree: 'B.Tech CSE',
      year: '2024 - 2028',
      cgpa: '7.49 / 10'
    }]
  });

  const twoPageResume = normalizeResumeData({
    contact: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 (555) 987-6543',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/janedoe',
      github: 'github.com/janedoe'
    },
    summary: 'Senior Software Engineer with 6+ years of experience designing high-throughput distributed microservices, cloud infrastructure, and user-facing dashboards. Proven track record in leading engineering teams, improving API latency by 45%, and migrating legacy monoliths to Kubernetes.',
    skills: ['Go', 'TypeScript', 'Node.js', 'React', 'Python', 'Kubernetes', 'Docker', 'AWS', 'PostgreSQL', 'Redis', 'Kafka', 'GraphQL', 'Terraform', 'CI/CD', 'System Architecture'],
    skillCategories: [
      { name: 'Languages', skills: ['Go', 'TypeScript', 'Python', 'SQL'] },
      { name: 'Infrastructure & Cloud', skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform'] },
      { name: 'Frameworks & Storage', skills: ['React', 'Node.js', 'PostgreSQL', 'Redis'] }
    ],
    experience: [
      {
        title: 'Lead Distributed Systems Architect',
        company: 'CloudScale Inc.',
        location: 'San Francisco, CA',
        startDate: '2022',
        endDate: 'Present',
        bullets: [
          'Architected multi-region event-driven microservices processing 50M+ daily events using Go and Apache Kafka.',
          'Reduced p99 API response latency from 450ms to 85ms across 12 core backend services.',
          'Spearheaded transition from monolith to containerized Kubernetes deployment pipelines using GitOps and ArgoCD.',
          'Mentored 14 junior and mid-level software engineers in clean architecture, unit testing, and performant SQL queries.'
        ]
      },
      {
        title: 'Senior Full-Stack Engineer',
        company: 'DataFlow Systems',
        location: 'San Jose, CA',
        startDate: '2019',
        endDate: '2022',
        bullets: [
          'Engineered real-time analytics dashboard with React, WebSockets, and Node.js for 100k+ active SaaS users.',
          'Designed relational database schema in PostgreSQL supporting 10TB+ telemetry data with zero downtime migrations.',
          'Built OAuth2 authentication and granular RBAC authorization microservice compliant with SOC2 Type II standards.'
        ]
      }
    ],
    projects: [
      {
        name: 'TigerPDF Cloud Engine',
        technologies: ['Node.js', 'PDFKit', 'Docker', 'Redis'],
        bullets: [
          'Developed high-performance distributed PDF rendering pipeline with worker queue scaling based on queue depth.',
          'Implemented streaming response handling reducing peak memory consumption per PDF render job by 60%.'
        ]
      },
      {
        name: 'Distributed Memory Cache',
        technologies: ['Go', 'gRPC', 'Raft Consensus'],
        bullets: [
          'Built fault-tolerant in-memory Key-Value store with consistent hashing and leader election via Raft.'
        ]
      }
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Electrical Engineering & Computer Sciences',
        year: '2015 - 2019',
        cgpa: '3.88 / 4.0'
      }
    ],
    certifications: [
      'AWS Certified Solutions Architect – Professional',
      'Certified Kubernetes Administrator (CKA)'
    ]
  });

  const threePlusPageResume = normalizeResumeData({
    contact: {
      name: 'Dr. Robert E. Smith',
      email: 'robert.smith@example.org',
      phone: '+1 (555) 234-5678',
      location: 'Boston, MA',
      linkedin: 'linkedin.com/in/drrobertsmith',
      github: 'github.com/robertsmith-phd'
    },
    summary: 'Principal AI Researcher & Systems Engineering Director with 12+ years of research and production expertise in Large Language Models, Distributed GPU Training, and High-Performance Compiler Optimizations. Published author of 18 peer-reviewed papers in top-tier conferences including NeurIPS, ICML, and ASPLOS.',
    skills: ['C++', 'Python', 'PyTorch', 'CUDA', 'Triton', 'Distributed Systems', 'LLM Alignment', 'Compiler Design', 'MPI', 'RoCEv2', 'TensorRT'],
    experience: [
      {
        title: 'Principal AI Research Director',
        company: 'Apex AI Research Labs',
        location: 'Boston, MA',
        startDate: '2021',
        endDate: 'Present',
        bullets: [
          'Pioneered distributed LLM training algorithms achieving 78% Model FLOPs Utilization (MFU) across 4,096 H100 GPUs.',
          'Designed custom GPU memory management kernel in CUDA reducing KV-cache fragmentation during long-context inference.',
          'Managed an annual R&D budget of $15M and led a team of 22 PhD researchers and staff machine learning engineers.',
          'Published 6 patents in memory-efficient attention mechanisms and hardware-aware quantization techniques.'
        ]
      },
      {
        title: 'Staff Machine Learning Engineer',
        company: 'Quantum Intelligence Institute',
        location: 'Cambridge, MA',
        startDate: '2017',
        endDate: '2021',
        bullets: [
          'Built C++ inference engine deployed to 200M+ mobile devices with 4x throughput improvement over standard ONNX Runtime.',
          'Engineered automatic mixed-precision compiler pass optimizing PyTorch computational graphs.',
          'Collaborated with hardware vendors to benchmark next-generation AI accelerators under synthetic workload suites.'
        ]
      },
      {
        title: 'Senior Systems Researcher',
        company: 'MIT Computer Science & Artificial Intelligence Laboratory (CSAIL)',
        location: 'Cambridge, MA',
        startDate: '2014',
        endDate: '2017',
        bullets: [
          'Investigated high-speed interconnect protocols for heterogeneous compute clusters using Infiniband and RDMA.',
          'Co-authored seminal research paper on fault-tolerant checkpointing for supercomputing nodes.'
        ]
      }
    ],
    projects: [
      {
        name: 'OpenTriton Compiler Framework',
        technologies: ['C++', 'LLVM', 'Python', 'CUDA'],
        bullets: [
          'Open-source domain specific language and compiler for parallel GPU kernel generation with 3.2k GitHub stars.',
          'Implemented auto-tuning optimizer matching hand-written CUDA assembly for matrix multiplication kernels.'
        ]
      },
      {
        name: 'Distributed Checkpoint Manager',
        technologies: ['C++', 'gRPC', 'NVMe-oF'],
        bullets: [
          'Created ultra-fast asynchronous model checkpointing system saving 500GB model states in under 1.2 seconds.'
        ]
      }
    ],
    education: [
      {
        institution: 'Massachusetts Institute of Technology (MIT)',
        degree: 'Ph.D. in Computer Science & Electrical Engineering',
        year: '2010 - 2014',
        cgpa: '4.0 / 4.0'
      },
      {
        institution: 'Stanford University',
        degree: 'Master of Science in Computer Science',
        year: '2008 - 2010',
        cgpa: '3.95 / 4.0'
      }
    ],
    certifications: [
      'NVIDIA Deep Learning Institute Certified Instructor',
      'AWS Certified Machine Learning – Specialty'
    ],
    achievements: [
      'Best Paper Award – NeurIPS 2023 for Research in Flash-Attention Extensions',
      'ACM SIGPLAN Outstanding Dissertation Award 2014',
      'National Science Foundation (NSF) Graduate Research Fellowship'
    ],
    customSections: [
      {
        title: 'Keynotes & Speaking Engagements',
        content: 'Keynote Speaker at IEEE High-Performance Computer Architecture (HPCA) 2024.\nInvited Lecturer at Stanford AI Seminar 2023.'
      }
    ]
  });

  const templates = ['classic', 'modern', 'creative'];

  // --- TEST 2: Classic Template PDF Generation (1-page, 2-page, 3+-page) ---
  await test('TEST 2: Classic Template PDF Generation across 1-page, 2-page, and 3+-page resumes', async () => {
    for (const r of [onePageResume, twoPageResume, threePlusPageResume]) {
      const pdfBuf = await pdfService.generatePdfBuffer({ resume: r, templateId: 'classic' });
      assert.ok(pdfBuf instanceof Buffer, 'Should return Buffer');
      assert.ok(pdfBuf.length > 500, 'Buffer should be non-empty');
      assert.strictEqual(pdfBuf.toString('ascii', 0, 4), '%PDF', 'Buffer should start with %PDF header');

      const details = await pdfService.extractPdfDetails(pdfBuf);
      assert.ok(details.pageCount >= 1, 'Extracted page count should be >= 1');
      assert.ok(details.text.includes(r.contact.name), `PDF text should contain contact name ${r.contact.name}`);
    }
  });

  // --- TEST 3: Modern Template PDF Generation ---
  await test('TEST 3: Modern Template PDF Generation across 1-page, 2-page, and 3+-page resumes', async () => {
    for (const r of [onePageResume, twoPageResume, threePlusPageResume]) {
      const pdfBuf = await pdfService.generatePdfBuffer({ resume: r, templateId: 'modern' });
      assert.ok(pdfBuf instanceof Buffer);
      assert.ok(pdfBuf.length > 500);
      assert.strictEqual(pdfBuf.toString('ascii', 0, 4), '%PDF');

      const details = await pdfService.extractPdfDetails(pdfBuf);
      assert.ok(details.pageCount >= 1);
      assert.ok(details.text.includes(r.contact.name));
    }
  });

  // --- TEST 4: Creative Template PDF Generation ---
  await test('TEST 4: Creative Template PDF Generation across 1-page, 2-page, and 3+-page resumes', async () => {
    for (const r of [onePageResume, twoPageResume, threePlusPageResume]) {
      const pdfBuf = await pdfService.generatePdfBuffer({ resume: r, templateId: 'creative' });
      assert.ok(pdfBuf instanceof Buffer);
      assert.ok(pdfBuf.length > 500);
      assert.strictEqual(pdfBuf.toString('ascii', 0, 4), '%PDF');

      const details = await pdfService.extractPdfDetails(pdfBuf);
      assert.ok(details.pageCount >= 1);
      assert.ok(details.text.includes(r.contact.name));
    }
  });

  // --- TEST 5: Edge cases (Missing sections, custom sections, achievements) ---
  await test('TEST 5: PDF Generation with missing sections, custom sections & achievements', async () => {
    const minimalWithCustom = normalizeResumeData({
      contact: { name: 'Minimal User', email: 'min@example.com' },
      summary: '',
      skills: [],
      projects: [],
      education: [],
      experience: [],
      achievements: ['Won 1st Place Hackathon 2024'],
      customSections: [{ title: 'Hobbies & Interests', content: 'Open source contributing, Chess, Photography' }]
    });

    for (const t of templates) {
      const buf = await pdfService.generatePdfBuffer({ resume: minimalWithCustom, templateId: t });
      assert.ok(buf instanceof Buffer);
      assert.ok(buf.length > 300);
      const details = await pdfService.extractPdfDetails(buf);
      assert.ok(details.text.includes('Minimal User') || details.text.includes('min@example.com'));
    }
  });

  console.log(`\nPRODUCTION PDF & FONT REGRESSION SUITE SUMMARY: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log('ALL PRODUCTION PDF & FONT REGRESSION TESTS PASSED SUCCESSFULLY! ✓\n');
  } else {
    process.exit(1);
  }
}

runPdfProductionFontsTestSuite().catch(err => {
  console.error('Fatal Production PDF Test Suite Error:', err);
  process.exit(1);
});
