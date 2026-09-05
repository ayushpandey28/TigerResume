const assert = require('assert');
const { buildDocumentModel, generateDocumentModelPdf, isGenericHeading } = require('./src/services/resume/documentModelService');
const { parseResume } = require('./src/services/resume/resumeParser');
const { normalizeResumeData } = require('./src/utils/resumeNormalizer');

async function runUniversalPipelineTests() {
  console.log('=== RUNNING TIGERRESUME UNIVERSAL PIPELINE TEST SUITE ===\n');
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  // =========================================================================
  // TEST 1: Generic Section Heading Detector (No Hardcoded Dictionaries)
  // =========================================================================
  test('Generic Section Heading Detection without Hardcoded Words', () => {
    // Custom headings that are NOT standard resume words
    const customHeadings = [
      'PATENTS & INVENTIONS',
      'EXHIBITIONS',
      'MILITARY SERVICE',
      'PHILOSOPHY OF EDUCATION',
      'OPEN SOURCE CONTRIBUTIONS',
      'I. RESEARCH GRANTS',
      '## SELECTED TALKS',
      'Section 1: Community Leadership',
      'Core Capabilities:'
    ];

    for (const h of customHeadings) {
      assert.ok(isGenericHeading(h, '', 'Some following content', 2, 1), `Heading should be detected: "${h}"`);
    }

    // Non-headings (sentences, bullet items, contact info)
    const nonHeadings = [
      '• Developed microservices architecture using Go and Kafka.',
      '1. Implemented continuous integration pipeline with Docker.',
      'This is a regular sentence describing job duties and responsibilities.',
      'user@example.com | +1 555 123 4567 | San Francisco',
      'https://github.com/myaccount'
    ];

    for (const nh of nonHeadings) {
      assert.ok(!isGenericHeading(nh, '', 'Next line'), `Sentence/bullet should NOT be heading: "${nh}"`);
    }
  });

  // =========================================================================
  // TEST 2: Resume A — Standard Single-Column Corporate Resume
  // =========================================================================
  await asyncTest('Resume A: Standard Single-Column Corporate Structure', async () => {
    const rawResumeA = `Morgan Vance
morgan.vance@example.org | (555) 321-9876 | Austin, TX
linkedin.com/in/morganvance

PROFESSIONAL SUMMARY
Results-driven software architect with 8+ years designing fault-tolerant cloud platforms.

CORE COMPETENCIES
Languages: Java, Kotlin, Python, SQL
Platforms: AWS, GCP, Kubernetes, Terraform

WORK EXPERIENCE
Principal Engineer — Apex Systems (2020 – Present)
• Spearheaded migration from monolithic services to event-driven microservices.
• Reduced 99th percentile latency by 45% across payment processing endpoints.
• Mentored junior engineers and led bi-weekly system design workshops.

EDUCATION
University of Texas at Austin
Bachelor of Science in Computer Science, 2016`;

    const docModelA = buildDocumentModel(rawResumeA, { fileName: 'morgan_resume.pdf' });

    // Assert Header
    assert.strictEqual(docModelA.header.name, 'Morgan Vance');
    assert.strictEqual(docModelA.header.email, 'morgan.vance@example.org');
    assert.strictEqual(docModelA.header.phone, '(555) 321-9876');
    assert.strictEqual(docModelA.header.location, 'Austin, TX');

    // Assert Sections
    assert.strictEqual(docModelA.sections.length, 4);
    const titlesA = docModelA.sections.map(s => s.title);
    assert.deepStrictEqual(titlesA, ['PROFESSIONAL SUMMARY', 'CORE COMPETENCIES', 'WORK EXPERIENCE', 'EDUCATION']);

    // Assert Blocks in Work Experience
    const expSec = docModelA.sections[2];
    const bullets = expSec.blocks.filter(b => b.type === 'bullet');
    assert.strictEqual(bullets.length, 3);
    assert.ok(bullets[0].text.includes('Spearheaded migration'));

    // Assert PDF Generation
    const pdfBuf = await generateDocumentModelPdf(docModelA);
    assert.ok(pdfBuf instanceof Buffer);
    assert.ok(pdfBuf.length > 1000);
  });

  // =========================================================================
  // TEST 3: Resume B — Academic / Researcher CV (Custom Sections & Non-Standard Headings)
  // =========================================================================
  await asyncTest('Resume B: Academic CV with Custom Headings (No Content Loss)', async () => {
    const rawResumeB = `Dr. Elena Rostova, Ph.D.
elena.rostova@lab.edu | +44 20 7946 0912 | Oxford, UK
github.com/erostova

RESEARCH INTERESTS
Computational biology, structural bioinformatics, Bayesian neural networks.

PEER-REVIEWED PUBLICATIONS
• Rostova, E. et al. (2024). Cryo-EM structural resolution of transmembrane receptors. Nature Methods.
• Rostova, E. & Smith, J. (2023). Stochastic gradient Markov chain Monte Carlo for protein dynamics. Bioinformatics.

GRANTS & FELLOWSHIPS
• European Research Council Starting Grant (€1.5M, 2024–2029)
• Wellcome Early-Career Award (2022–2024)

TEACHING & MENTORING
• Course Lecturer: Advanced Algorithms in Molecular Biology (Graduate level)
• Supervised 4 Master's theses and 2 undergraduate research projects.

INVITED TALKS
• Keynote: European Bioinformatics Conference 2024, Basel, Switzerland
• Seminar: MIT CSAIL Biophysics Colloquium, Cambridge, USA`;

    const docModelB = buildDocumentModel(rawResumeB, { fileName: 'elena_cv.pdf' });

    assert.ok(docModelB.header.name.includes('Elena Rostova'));
    assert.strictEqual(docModelB.header.email, 'elena.rostova@lab.edu');

    // Assert Custom Sections are ALL preserved without loss or being forced into "unknown"
    assert.strictEqual(docModelB.sections.length, 5);
    const expectedTitles = [
      'RESEARCH INTERESTS',
      'PEER-REVIEWED PUBLICATIONS',
      'GRANTS & FELLOWSHIPS',
      'TEACHING & MENTORING',
      'INVITED TALKS'
    ];
    const actualTitles = docModelB.sections.map(s => s.title);
    assert.deepStrictEqual(actualTitles, expectedTitles);

    // Verify all publication bullets preserved
    const pubSec = docModelB.sections[1];
    assert.strictEqual(pubSec.blocks.length, 2);
    assert.ok(pubSec.blocks[0].text.includes('Cryo-EM structural resolution'));
    assert.ok(pubSec.blocks[1].text.includes('Stochastic gradient Markov chain'));

    // Assert PDF Buffer
    const pdfBuf = await generateDocumentModelPdf(docModelB);
    assert.ok(pdfBuf.length > 1000);
  });

  // =========================================================================
  // TEST 4: Resume C — Non-Standard Section Ordering
  // =========================================================================
  await asyncTest('Resume C: Non-Standard Section Ordering Preserved Verbatim', async () => {
    // Ordering: Education first, then Licenses, then Military Service, then Core Expertise, then Projects
    const rawResumeC = `Sergeant James Miller
james.miller@veterans.org | 703-555-0144 | Alexandria, VA

EDUCATION
United States Military Academy at West Point
Bachelor of Science in Mechanical Engineering, 2018

LICENSES & CREDENTIALS
• Project Management Professional (PMP)
• Certified Information Systems Security Professional (CISSP)

MILITARY SERVICE
Logistics Battalion Commander — US Army (2018 – 2023)
• Commanded detachment of 120 personnel during NATO logistical exercises.
• Maintained zero inventory discrepancy across $45M in hardware assets.

CORE EXPERTISE
Operations: Supply Chain, Crisis Management, Risk Assessment
Security: DoD Top Secret Clearance, Incident Response

PROJECTS
Fleet Tracking Dashboard
• Implemented GPS vehicle monitoring application reducing fuel consumption by 14%.`;

    const docModelC = buildDocumentModel(rawResumeC);

    const actualOrder = docModelC.sections.map(s => s.title);
    const expectedOrder = [
      'EDUCATION',
      'LICENSES & CREDENTIALS',
      'MILITARY SERVICE',
      'CORE EXPERTISE',
      'PROJECTS'
    ];

    // Document Model MUST NOT reorder sections to match TigerResume's internal schema
    assert.deepStrictEqual(actualOrder, expectedOrder, 'Section ordering MUST be preserved exactly as uploaded');

    // Military Service must NOT be dropped
    const militarySec = docModelC.sections.find(s => s.title === 'MILITARY SERVICE');
    assert.ok(militarySec, 'Military Service section must exist');
    assert.strictEqual(militarySec.blocks.filter(b => b.type === 'bullet').length, 2);

    const pdfBuf = await generateDocumentModelPdf(docModelC);
    assert.ok(pdfBuf.length > 1000);
  });

  // =========================================================================
  // TEST 5: Resume D — Minimalist Resume (Missing Conventional Sections)
  // =========================================================================
  await asyncTest('Resume D: Minimalist Resume with Missing Conventional Sections', async () => {
    // Only Contact and Selected Works
    const rawResumeD = `Aria Chen
aria@designer.co | Los Angeles, CA
https://ariachen.design

SELECTED WORKS
1. Mobile Banking Redesign
Created end-to-end design system adopted by 2M active users.
2. Healthcare Telemedicine Portal
Designed accessible HIPAA-compliant appointment booking workflow.`;

    const docModelD = buildDocumentModel(rawResumeD);

    assert.strictEqual(docModelD.header.name, 'Aria Chen');
    assert.strictEqual(docModelD.header.email, 'aria@designer.co');
    assert.strictEqual(docModelD.sections.length, 1);
    assert.strictEqual(docModelD.sections[0].title, 'SELECTED WORKS');
    assert.ok(docModelD.sections[0].blocks.length >= 2);

    // Verify PDF generation does not crash on missing summary/skills/education/experience
    const pdfBuf = await generateDocumentModelPdf(docModelD);
    assert.ok(pdfBuf.length > 500);
  });

  // =========================================================================
  // TEST 6: Resume E — Roman Numeral & Key-Value Multi-Category Technical Layout
  // =========================================================================
  await asyncTest('Resume E: Roman Numeral Headings and Key-Value Structure', async () => {
    const rawResumeE = `Devon Brooks
devon@infra.cloud | Seattle, WA

I. OVERVIEW
Infrastructure engineer specializing in high-throughput network fabrics.

II. TECHNICAL STACK
Runtime: Go, C++, Rust
Databases: CockroachDB, ScyllaDB, Redis
Messaging: Kafka, RabbitMQ, NATS
Orchestration: Kubernetes, Nomad, Consul

III. RECENT PROJECTS
Low-Latency Packet Filter:
• Implemented eBPF kernel packet inspection routing 10Gbps line-rate traffic.
Distributed Rate Limiter:
• Engineered Redis token-bucket cluster supporting 500k RPS with sub-millisecond p99.`;

    const docModelE = buildDocumentModel(rawResumeE);

    assert.strictEqual(docModelE.sections.length, 3);
    // Titles cleaned of Roman numeral prefixes
    assert.strictEqual(docModelE.sections[0].title, 'OVERVIEW');
    assert.strictEqual(docModelE.sections[1].title, 'TECHNICAL STACK');
    assert.strictEqual(docModelE.sections[2].title, 'RECENT PROJECTS');

    // Section 2 must have key_value blocks
    const kvBlocks = docModelE.sections[1].blocks.filter(b => b.type === 'key_value');
    assert.strictEqual(kvBlocks.length, 4);
    assert.strictEqual(kvBlocks[0].key, 'Runtime');
    assert.ok(kvBlocks[0].value.includes('Go, C++, Rust'));
    assert.strictEqual(kvBlocks[1].key, 'Databases');

    const pdfBuf = await generateDocumentModelPdf(docModelE);
    assert.ok(pdfBuf.length > 1000);
  });

  // =========================================================================
  // TEST 7: Document Model In-Place Edit & Round-Trip PDF Synthesis
  // =========================================================================
  await asyncTest('Document Model Mutation & Edited PDF Generation', async () => {
    const raw = `Sam Taylor
sam@test.com

SKILLS
Python, JavaScript

PROJECTS
• Portfolio Website`;

    const docModel = buildDocumentModel(raw);

    // Simulate user edits in EditableDocumentEditor
    docModel.header.name = 'Samantha Taylor, Senior Architect';
    docModel.header.phone = '+1 (555) 999-0000';
    docModel.sections[0].title = 'TECHNICAL PROFICIENCIES';
    docModel.sections[1].blocks.push({
      id: 'blk_new',
      type: 'bullet',
      text: 'AI Agent Workflow Automation Platform'
    });

    const editedPdf = await generateDocumentModelPdf(docModel);
    assert.ok(editedPdf instanceof Buffer);
    assert.ok(editedPdf.length > 1000);
  });

  // =========================================================================
  // TEST 8: Fundamental Rule Check: Document Model != TigerResume Template
  // =========================================================================
  test('Fundamental Rule: Document Model != Template Schema', () => {
    const rawSpecial = `Jordan Lee
jordan@arts.org

EXHIBITIONS & GALLERIES
• 2024: Biennial of Digital Arts, Paris
• 2023: Solo Exhibition at Modern Space, Tokyo

PHILOSOPHY & ARTIST STATEMENT
Exploring generative algorithms and human perception through spatial installations.`;

    const docModel = buildDocumentModel(rawSpecial);

    // Document Model keeps EXHIBITIONS & GALLERIES and PHILOSOPHY verbatim
    assert.strictEqual(docModel.sections[0].title, 'EXHIBITIONS & GALLERIES');
    assert.strictEqual(docModel.sections[1].title, 'PHILOSOPHY & ARTIST STATEMENT');

    // Semantic normalization for ATS safely provides fallback without mutating documentModel
    const semantic = normalizeResumeData({
      summary: docModel.sections[1].blocks[0]?.text || '',
      skills: []
    });

    assert.ok(semantic.summary.includes('generative algorithms'));
    assert.strictEqual(docModel.sections[0].title, 'EXHIBITIONS & GALLERIES', 'documentModel remains untouched');
  });

  console.log(`\nUNIVERSAL TEST SUITE SUMMARY: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log('ALL UNIVERSAL PIPELINE TESTS PASSED SUCCESSFULLY! ✓\n');
  } else {
    process.exit(1);
  }
}

runUniversalPipelineTests().catch(err => {
  console.error('Fatal Universal Test Error:', err);
  process.exit(1);
});
