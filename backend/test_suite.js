const assert = require('assert');
const { parseResume } = require('./src/services/resume/resumeParser');
const { normalizeResumeData } = require('./src/utils/resumeNormalizer');
const pdfService = require('./src/services/resume/pdfService');

async function runTestSuite() {
  console.log('=== RUNNING TIGERRESUME COMPREHENSIVE TEST SUITE ===\n');
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

  // --- TEST 1: User's Reference Resume ---
  await asyncTest('Parse User Reference Resume (Ayush Pandey)', async () => {
    const rawResume = `Ayush Pandey
pandeyayush84849@gmail.com | +91-8299560054 | Ghaziabad, India
linkedin.com/in/ayushpandey | github.com/ayushpandey

PROFESSIONAL SUMMARY
B.Tech Computer Science and Engineering undergraduate specializing in full-stack development with React and Node.js. Passionate about building scalable web applications and intuitive user experiences.

TECHNICAL SKILLS
Programming Languages:
C++, C, Python

Frontend:
HTML, CSS, JavaScript, React, React Native

Backend:
Node.js, REST APIs

Databases & Data Tools:
SQL, Firebase, Tableau, Excel

Core CS:
Data Structures & Algorithms, OOP, DBMS, Operating Systems, Computer Networks

Developer Tools:
Git, GitHub

PROJECTS
TigerPDF
Technologies: React.js, Node.js, REST APIs
- Developed a full-stack PDF management platform
- Built REST APIs
- Implemented authentication

TigerResume
Technologies: React.js, Next.js, Node.js
- Developed an AI-powered resume builder
- Created customizable templates
- Implemented resume management

EDUCATION
KIET Group of Institutions, Ghaziabad
Bachelor of Technology in Computer Science and Engineering
2024–2028
CGPA: 7.49 / 10

CERTIFICATIONS
1. Machine Learning Specialization — Stanford Online & Coursera
2. AWS Certified Cloud Practitioner — Amazon Web Services

TRAINING / INTERNSHIP
ACITE & SmartBridge
ServiceNow Virtual Internship Program`;

    const parsed = await parseResume(rawResume);

    // Assert Contact Info
    assert.strictEqual(parsed.contact.name, 'Ayush Pandey');
    assert.strictEqual(parsed.contact.email, 'pandeyayush84849@gmail.com');
    assert.strictEqual(parsed.contact.phone, '+91-8299560054');
    assert.strictEqual(parsed.contact.location, 'Ghaziabad, India');
    assert.ok(parsed.contact.linkedin.includes('ayushpandey'));
    assert.ok(parsed.contact.github.includes('ayushpandey'));

    // Assert Summary does NOT contain Technical Skills
    assert.ok(!parsed.summary.includes('TECHNICAL SKILLS'));
    assert.ok(!parsed.summary.includes('Programming Languages'));
    assert.ok(parsed.summary.includes('B.Tech Computer Science'));

    // Assert Skill Categories
    assert.strictEqual(parsed.skillCategories.length, 6);
    const catNames = parsed.skillCategories.map(c => c.name);
    assert.ok(catNames.includes('Programming Languages'));
    assert.ok(catNames.includes('Frontend'));
    assert.ok(catNames.includes('Backend'));
    assert.ok(catNames.includes('Databases & Data Tools'));
    assert.ok(catNames.includes('Core CS'));
    assert.ok(catNames.includes('Developer Tools'));

    // Assert Flat Skills for ATS compatibility
    assert.ok(parsed.skills.includes('C++'));
    assert.ok(parsed.skills.includes('React'));
    assert.ok(parsed.skills.includes('Node.js'));
    assert.ok(parsed.skills.includes('SQL'));
    assert.ok(parsed.skills.includes('Git'));
    assert.ok(parsed.skills.length >= 20);

    // Assert Projects
    assert.strictEqual(parsed.projects.length, 2);
    assert.strictEqual(parsed.projects[0].name, 'TigerPDF');
    assert.deepStrictEqual(parsed.projects[0].technologies, ['React.js', 'Node.js', 'REST APIs']);
    assert.strictEqual(parsed.projects[0].bullets.length, 3);
    assert.strictEqual(parsed.projects[0].bullets[0], 'Developed a full-stack PDF management platform');

    assert.strictEqual(parsed.projects[1].name, 'TigerResume');
    assert.deepStrictEqual(parsed.projects[1].technologies, ['React.js', 'Next.js', 'Node.js']);
    assert.strictEqual(parsed.projects[1].bullets.length, 3);

    // Assert Education
    assert.strictEqual(parsed.education.length, 1);
    assert.strictEqual(parsed.education[0].institution, 'KIET Group of Institutions, Ghaziabad');
    assert.strictEqual(parsed.education[0].degree, 'Bachelor of Technology in Computer Science and Engineering');
    assert.ok(parsed.education[0].year.includes('2024') && parsed.education[0].year.includes('2028'));
    assert.ok(parsed.education[0].cgpa.includes('7.49'));

    // Assert Certifications
    assert.strictEqual(parsed.certifications.length, 2);
    assert.ok(parsed.certifications[0].includes('Machine Learning Specialization'));
    assert.ok(parsed.certifications[1].includes('AWS Certified Cloud Practitioner'));

    // Assert Training/Internships in Experience
    assert.ok(parsed.experience.length >= 1);
  });

  // --- TEST 2: Heading Variations and Wrapping Lines ---
  await asyncTest('Handle Heading Variations, Numbering & Line Wraps', async () => {
    const raw = `Jane Doe
jane.doe@example.com | +1 (555) 234-5678 | San Francisco, CA
https://linkedin.com/in/janedoe | https://github.com/janedoe

1. PROFILE
Experienced Full-Stack Developer passionate about distributed systems
and modern web architectures with high throughput.

2. CORE COMPETENCIES
Languages: TypeScript, JavaScript, Python
Frameworks: React, Next.js, Express

3. SELECTED PROJECTS
1) Distributed Cache System
Built an in-memory distributed cache with consistent hashing
and replication protocols across multi-region nodes.
Technologies: Go, Redis, Docker

4. ACADEMIC BACKGROUND
University of California, Berkeley
Bachelor of Science in Electrical Engineering and Computer Sciences
Graduation: 2023
GPA: 3.85 / 4.0

5. LICENSES & CERTIFICATIONS
• Google Cloud Professional Cloud Architect
• Certified Kubernetes Administrator (CKA)`;

    const res = await parseResume(raw);
    assert.strictEqual(res.contact.name, 'Jane Doe');
    assert.strictEqual(res.contact.email, 'jane.doe@example.com');
    assert.strictEqual(res.contact.location, 'San Francisco, CA');
    assert.ok(res.summary.includes('distributed systems and modern web architectures'));
    assert.strictEqual(res.projects.length, 1);
    assert.strictEqual(res.projects[0].name, 'Distributed Cache System');
    assert.ok(res.projects[0].description.includes('consistent hashing'));
    assert.strictEqual(res.education.length, 1);
    assert.strictEqual(res.education[0].institution, 'University of California, Berkeley');
    assert.ok(res.education[0].cgpa.includes('3.85'));
    assert.strictEqual(res.certifications.length, 2);
  });

  // --- TEST 3: Backward Compatibility with Legacy Resume Formats ---
  test('Normalize Legacy Resume Data Safely', () => {
    // Old resume where skills is a flat array, education has only details, projects is an old single object
    const legacyResume = {
      title: "Old Stored Resume",
      contact: {
        name: "Legacy User",
        email: "legacy@test.com"
      },
      summary: "Old summary string",
      skills: ["React", "Node.js", "MongoDB"],
      education: [{
        degree: "",
        institution: "",
        year: "",
        details: "Delhi Technological University, B.Tech 2022, CGPA: 8.2"
      }],
      experience: [{
        title: "Frontend Developer",
        company: "Acme Corp",
        description: "- Built UI components\n- Improved load time by 30%"
      }],
      projects: [{
        name: "E-Commerce App",
        description: "Built full-stack store with payment gateway",
        technologies: "React, Node.js, Stripe"
      }],
      certifications: ["Old Cert 1, Old Cert 2"]
    };

    const normalized = normalizeResumeData(legacyResume);
    assert.strictEqual(normalized.contact.name, "Legacy User");
    assert.strictEqual(normalized.contact.phone, ""); // Safe default
    assert.strictEqual(normalized.skills.length, 3);
    assert.strictEqual(normalized.education.length, 1);
    assert.ok(normalized.education[0].cgpa.includes("8.2"));
    assert.strictEqual(normalized.experience.length, 1);
    assert.strictEqual(normalized.experience[0].bullets.length, 2);
    assert.strictEqual(normalized.projects.length, 1);
    assert.deepStrictEqual(normalized.projects[0].technologies, ["React", "Node.js", "Stripe"]);
  });

  // --- TEST 4: Null/Empty Safe Defaults ---
  test('Handle Null/Empty Resume without Crashing', () => {
    const empty = normalizeResumeData(null);
    assert.strictEqual(typeof empty.contact, 'object');
    assert.strictEqual(empty.contact.name, '');
    assert.deepStrictEqual(empty.skills, []);
    assert.deepStrictEqual(empty.skillCategories, []);
    assert.deepStrictEqual(empty.projects, []);
    assert.deepStrictEqual(empty.education, []);
    assert.deepStrictEqual(empty.experience, []);
    assert.deepStrictEqual(empty.certifications, []);
  });

  // --- TEST 5: PDF Generation for All 3 Templates ---
  await asyncTest('Generate PDF Buffer for Classic, Modern, and Creative', async () => {
    const mockResume = normalizeResumeData({
      contact: { name: 'Ayush Pandey', email: 'ayush@example.com', phone: '+91 8299560054', location: 'Ghaziabad, India' },
      summary: 'Passionate developer.',
      skillCategories: [{ name: 'Frontend', skills: ['HTML', 'CSS', 'React'] }],
      projects: [{ name: 'TigerResume', technologies: ['React', 'Next.js'], bullets: ['Built AI builder', 'Custom templates'] }],
      education: [{ degree: 'B.Tech CSE', institution: 'KIET', year: '2024 - 2028', cgpa: '7.49' }],
      certifications: ['AWS Certified Cloud Practitioner']
    });

    for (const t of ['classic', 'modern', 'creative']) {
      const buf = await pdfService.generatePdfBuffer({ resume: mockResume, templateId: t });
      assert.ok(buf instanceof Buffer);
      assert.ok(buf.length > 500, `Buffer for ${t} should be non-empty`);
    }
  });

  // --- TEST 6: Single-Line Contact Header with Separators ---
  await asyncTest('Parse Single-Line Contact Header with Pipe Separators', async () => {
    const raw = `Ayush Pandey | pandeyayush84849@gmail.com | +91-8299560054 | Ghaziabad, India
https://linkedin.com/in/ayushpandey | https://github.com/ayushpandey

SUMMARY
Full-stack software developer.`;

    const parsed = await parseResume(raw);
    assert.strictEqual(parsed.contact.name, 'Ayush Pandey');
    assert.strictEqual(parsed.contact.email, 'pandeyayush84849@gmail.com');
    assert.strictEqual(parsed.contact.phone, '+91-8299560054');
    assert.strictEqual(parsed.contact.location, 'Ghaziabad, India');
    assert.ok(parsed.contact.linkedin.includes('ayushpandey'));
    assert.ok(parsed.contact.github.includes('ayushpandey'));
  });

  // --- TEST 7: Inline Project Technologies, Links & Circle Bullets ---
  await asyncTest('Parse Inline Project Technologies, Links & Circle Bullets', async () => {
    const raw = `John Smith
john@example.com | 555-123-4567

PROJECTS
TigerPDF | React.js, Node.js, Express (https://github.com/john/tigerpdf)
○ Developed high-performance PDF manipulation service
with distributed worker queues and cloud storage
○ Implemented secure JWT user sessions

TigerResume (React.js, Next.js, MongoDB)
○ Created modern resume builder with live preview`;

    const parsed = await parseResume(raw);
    assert.strictEqual(parsed.projects.length, 2);

    // First Project
    assert.strictEqual(parsed.projects[0].name, 'TigerPDF');
    assert.ok(parsed.projects[0].technologies.includes('React.js'));
    assert.ok(parsed.projects[0].technologies.includes('Node.js'));
    assert.ok(parsed.projects[0].link.includes('github.com/john/tigerpdf'));
    assert.strictEqual(parsed.projects[0].bullets.length, 2);
    assert.ok(parsed.projects[0].bullets[0].includes('distributed worker queues')); // Wrapped line joined

    // Second Project
    assert.strictEqual(parsed.projects[1].name, 'TigerResume');
    assert.ok(parsed.projects[1].technologies.includes('Next.js'));
    assert.strictEqual(parsed.projects[1].bullets.length, 1);
  });

  // --- TEST 8: Roman Numeral, Markdown & Extended Section Headings ---
  await asyncTest('Handle Roman Numeral, Markdown & Extended Headings', async () => {
    const raw = `Alex Turner
alex@example.com

I. SUMMARY
Passionate systems architect.

II. TECHNICAL PROFICIENCIES
Programming Languages: Rust, C++, Go

### PROJECTS
1. High-Speed Router
Built packet router.

IV. EDUCATION
MIT
Master of Science in Computer Science
Graduation: 2024

V. CERTIFICATIONS & TRAINING
1. AWS Certified Solutions Architect

VI. TRAINING & INTERNSHIP
Google Summer of Code
Kernel Development Intern`;

    const parsed = await parseResume(raw);
    assert.ok(parsed.summary.includes('Passionate systems architect'));
    assert.ok(parsed.skills.includes('Rust'));
    assert.strictEqual(parsed.projects.length, 1);
    assert.strictEqual(parsed.projects[0].name, 'High-Speed Router');
    assert.strictEqual(parsed.education.length, 1);
    assert.strictEqual(parsed.certifications.length, 1);
    assert.ok(parsed.certifications[0].includes('AWS Certified Solutions Architect'));
    assert.ok(parsed.experience.some(e => e.title.includes('Google Summer of Code') || e.company.includes('Google Summer of Code') || e.title.includes('Kernel Development')));
  });

  // --- TEST 9: Multi-Degree Education Entries ---
  await asyncTest('Parse Multi-Degree Education Entries Cleanly', async () => {
    const raw = `Dev Candidate
dev@example.com

EDUCATION
Stanford University
Master of Science in Computer Science
2022 - 2024
GPA: 3.9 / 4.0

University of California, Berkeley
Bachelor of Science in Electrical Engineering
2018 - 2022
GPA: 3.8 / 4.0`;

    const parsed = await parseResume(raw);
    assert.strictEqual(parsed.education.length, 2);
    assert.strictEqual(parsed.education[0].institution, 'Stanford University');
    assert.ok(parsed.education[0].degree.includes('Master of Science'));
    assert.strictEqual(parsed.education[1].institution, 'University of California, Berkeley');
    assert.ok(parsed.education[1].degree.includes('Bachelor of Science'));
  });

  // --- TEST 10: Empty Sections PDF Safety & Untitled Fallback ---
  await asyncTest('Safely Generate PDF with Completely Empty Sections & Untitled Fallback', async () => {
    const minimalResume = normalizeResumeData({
      title: 'Untitled Resume',
      contact: { email: 'test@example.com' },
      summary: '',
      skills: [],
      skillCategories: [],
      projects: [],
      education: [],
      experience: [],
      certifications: []
    });

    assert.strictEqual(minimalResume.contact.name, ''); // Should NOT be 'Untitled Resume'

    for (const t of ['classic', 'modern', 'creative']) {
      const buf = await pdfService.generatePdfBuffer({ resume: minimalResume, templateId: t });
      assert.ok(buf instanceof Buffer);
      assert.ok(buf.length > 300, `Buffer for empty ${t} should be valid`);
    }
  });

  console.log(`\nTEST SUITE SUMMARY: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log('ALL TESTS PASSED SUCCESSFULLY! ✓\n');
  } else {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
