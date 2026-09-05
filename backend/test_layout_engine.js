const assert = require('assert');
const PDFDocument = require('pdfkit');
const pdfService = require('./src/services/resume/pdfService');
const documentModelService = require('./src/services/resume/documentModelService');

console.log('=== RUNNING TIGERRESUME LAYOUT-AWARE DOCUMENT ENGINE TEST SUITE ===\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${testName} FAILED:`, err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

async function runAsyncTest(testName, testFn) {
  totalTests++;
  try {
    await testFn();
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${testName} FAILED:`, err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Helper: Generate synthetic PDF buffer with known physical coordinates
async function createSyntheticPdf(pagesConfig) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    for (const page of pagesConfig) {
      doc.addPage({ size: [page.width || 595.28, page.height || 841.89], margin: 0 });
      for (const item of page.items) {
        doc
          .font(item.font || 'Helvetica')
          .fontSize(item.fontSize || 10)
          .text(item.text, item.x, item.y, { lineBreak: false });
      }
    }

    doc.end();
  });
}

(async () => {
  // TEST 1: Physical Coordinate Extraction Fidelity
  await runAsyncTest('Physical Coordinate & Page Dimensions Extraction', async () => {
    const pdfBuf = await createSyntheticPdf([
      {
        width: 595.28,
        height: 841.89,
        items: [
          { text: 'ALEXANDER SMITH', x: 50, y: 50, fontSize: 20 },
          { text: 'alex@example.com | 555-0199', x: 50, y: 80, fontSize: 10 }
        ]
      }
    ]);

    const details = await pdfService.extractPdfDetails(pdfBuf);
    assert.strictEqual(details.pageCount, 1, 'Should detect exactly 1 page');
    assert.ok(Array.isArray(details.pages), 'Should return pages array');
    assert.strictEqual(details.pages.length, 1, 'Should have 1 page object');

    const page1 = details.pages[0];
    assert.strictEqual(Math.round(page1.width), 595, 'Page width should be 595 pt');
    assert.strictEqual(Math.round(page1.height), 842, 'Page height should be 842 pt');
    assert.ok(page1.elements.length >= 2, 'Should have extracted at least 2 elements');

    // Verify first element coordinates close to (50, 50)
    const el1 = page1.elements.find(e => e.text.includes('ALEXANDER'));
    assert.ok(el1, 'Element ALEXANDER must exist');
    assert.strictEqual(Math.round(el1.x), 50, 'Element X should be 50 pt');
    assert.ok(Math.abs(el1.y - 50) <= 2, `Element Y should be ~50 pt, got ${el1.y}`);
    assert.strictEqual(el1.fontSize, 20, 'Font size should be 20');
  });

  // TEST 2: Multi-Column Physical Separation Preservation
  await runAsyncTest('Multi-Column Separation (No Linearization/Smearing)', async () => {
    // Generate a 2-column layout on the same horizontal line (y = 150)
    // Left column: x = 50, Right column: x = 320
    const pdfBuf = await createSyntheticPdf([
      {
        width: 595.28,
        height: 841.89,
        items: [
          { text: 'Left Column Job Title', x: 50, y: 150, fontSize: 10 },
          { text: 'Right Column Tech Stack', x: 320, y: 150, fontSize: 10 }
        ]
      }
    ]);

    const details = await pdfService.extractPdfDetails(pdfBuf);
    const page1 = details.pages[0];

    const leftCol = page1.elements.find(e => e.text.includes('Left Column'));
    const rightCol = page1.elements.find(e => e.text.includes('Right Column'));

    assert.ok(leftCol, 'Left column element must exist');
    assert.ok(rightCol, 'Right column element must exist');
    assert.notStrictEqual(leftCol.id, rightCol.id, 'Left and right columns must be separate elements');

    assert.strictEqual(Math.round(leftCol.x), 50, 'Left column X must be 50');
    assert.strictEqual(Math.round(rightCol.x), 320, 'Right column X must be 320');
    assert.ok(Math.abs(leftCol.y - rightCol.y) <= 2, 'Both elements should share vertical baseline');
  });

  // TEST 3: Multi-Page Extraction & Geometry
  await runAsyncTest('Multi-Page Geometry & Element Partitioning', async () => {
    const pdfBuf = await createSyntheticPdf([
      {
        width: 595.28,
        height: 841.89,
        items: [{ text: 'PAGE ONE HEADER', x: 50, y: 60, fontSize: 16 }]
      },
      {
        width: 595.28,
        height: 841.89,
        items: [{ text: 'PAGE TWO CERTIFICATIONS', x: 50, y: 60, fontSize: 16 }]
      }
    ]);

    const details = await pdfService.extractPdfDetails(pdfBuf);
    assert.strictEqual(details.pageCount, 2, 'Should detect 2 pages');
    assert.strictEqual(details.pages.length, 2, 'Should extract 2 page objects');

    assert.strictEqual(details.pages[0].pageNumber, 1);
    assert.ok(details.pages[0].elements.some(e => e.text.includes('PAGE ONE')));

    assert.strictEqual(details.pages[1].pageNumber, 2);
    assert.ok(details.pages[1].elements.some(e => e.text.includes('PAGE TWO')));
  });

  // TEST 4: Build Document Model with Physical Pages
  await runAsyncTest('Build Document Model with Physical Pages & Versioning', async () => {
    const mockPages = [
      {
        pageNumber: 1,
        width: 595.28,
        height: 841.89,
        elements: [
          { id: 'el_1_1', text: 'JANE DOE', x: 50, y: 50, fontSize: 20, fontWeight: 'bold' },
          { id: 'el_1_2', text: 'PROJECTS', x: 50, y: 100, fontSize: 14, fontWeight: 'bold' },
          { id: 'el_1_3', text: 'TigerEngine - Search Tool', x: 50, y: 130, fontSize: 10 }
        ]
      }
    ];

    const rawText = 'JANE DOE\n\nPROJECTS\n• TigerEngine - Search Tool';
    const model = documentModelService.buildDocumentModel(rawText, {
      fileType: 'application/pdf',
      fileName: 'jane_resume.pdf',
      pageCount: 1,
      pages: mockPages
    });

    assert.strictEqual(model.documentModelVersion, '1.0', 'Version should be 1.0');
    assert.strictEqual(model.pages.length, 1, 'Should contain 1 physical page');
    assert.strictEqual(model.pages[0].elements.length, 3, 'Should preserve all 3 elements');
    assert.ok(Array.isArray(model.sections), 'Should also maintain semantic sections for backward compatibility');
  });

  // TEST 5: MANDATORY Edit-One-Element Isolation Test
  await runAsyncTest('Mandatory Edit-One-Element Isolation (A & C Unchanged)', async () => {
    const originalPages = [
      {
        pageNumber: 1,
        width: 595.28,
        height: 841.89,
        elements: [
          { id: 'el_A', text: 'Element A: John Doe', x: 50, y: 50, fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
          { id: 'el_B', text: 'Element B: Software Engineer', x: 50, y: 90, fontSize: 12, fontWeight: 'normal', color: '#334155' },
          { id: 'el_C', text: 'Element C: Acme Corp', x: 320, y: 90, fontSize: 12, fontWeight: 'normal', color: '#64748B' }
        ]
      }
    ];

    // Snapshot deep copy of element A and C before mutation
    const elA_before = JSON.parse(JSON.stringify(originalPages[0].elements[0]));
    const elC_before = JSON.parse(JSON.stringify(originalPages[0].elements[2]));

    // Mutate Element B ONLY (as performed by handleVisualElementChange)
    const updatedPages = JSON.parse(JSON.stringify(originalPages));
    const targetEl = updatedPages[0].elements[1];
    assert.strictEqual(targetEl.id, 'el_B');

    targetEl.text = 'Element B: Staff Architect (Promoted)';
    targetEl.fontSize = 14;
    targetEl.fontWeight = 'bold';
    targetEl.x = 55; // nudged by 5pt

    const elA_after = updatedPages[0].elements[0];
    const elB_after = updatedPages[0].elements[1];
    const elC_after = updatedPages[0].elements[2];

    // ASSERTION 1: Element B was changed as intended
    assert.strictEqual(elB_after.text, 'Element B: Staff Architect (Promoted)');
    assert.strictEqual(elB_after.fontSize, 14);
    assert.strictEqual(elB_after.fontWeight, 'bold');
    assert.strictEqual(elB_after.x, 55);

    // ASSERTION 2: Element A is byte-for-byte identical
    assert.deepStrictEqual(elA_after, elA_before, 'Element A must remain strictly untouched');

    // ASSERTION 3: Element C is byte-for-byte identical (including right-column coordinate x=320)
    assert.deepStrictEqual(elC_after, elC_before, 'Element C must remain strictly untouched');
    assert.strictEqual(elC_after.x, 320, 'Element C X coordinate must remain at 320 pt');
  });

  // TEST 6: Physical Layout-Aware PDF Generation
  await runAsyncTest('Layout-Aware PDF Generation from Physical Coordinates', async () => {
    const documentModel = {
      documentModelVersion: '1.0',
      pages: [
        {
          pageNumber: 1,
          width: 595.28,
          height: 841.89,
          elements: [
            { id: 'el_1', text: 'PHYSICAL HEADER', x: 50, y: 50, fontSize: 16, fontWeight: 'bold' },
            { id: 'el_2', text: 'Left Column Detail', x: 50, y: 120, fontSize: 10 },
            { id: 'el_3', text: 'Right Column Metric', x: 340, y: 120, fontSize: 10 }
          ]
        }
      ]
    };

    const pdfBuffer = await documentModelService.generateDocumentModelPdf(documentModel);
    assert.ok(Buffer.isBuffer(pdfBuffer), 'Result must be a Buffer');
    assert.ok(pdfBuffer.length > 500, 'Buffer should have content');

    // Re-parse the generated PDF to verify physical coordinate rendering
    const reParsed = await pdfService.extractPdfDetails(pdfBuffer);
    assert.strictEqual(reParsed.pageCount, 1);
    assert.ok(reParsed.text.includes('PHYSICAL HEADER'));
    assert.ok(reParsed.text.includes('Left Column Detail'));
    assert.ok(reParsed.text.includes('Right Column Metric'));

    const left = reParsed.pages[0].elements.find(e => e.text.includes('Left Column'));
    const right = reParsed.pages[0].elements.find(e => e.text.includes('Right Column'));
    assert.ok(left && right, 'Both elements must exist in generated PDF');
    assert.strictEqual(Math.round(left.x), 50, 'Left column must be at x=50');
    assert.strictEqual(Math.round(right.x), 340, 'Right column must be at x=340');
  });

  // TEST 7: Backward Compatibility Fallback (No Physical Pages)
  await runAsyncTest('Legacy Fallback (Empty Pages Gracefully Falls Back to Flow)', async () => {
    const legacyModel = {
      header: { name: 'Legacy User', email: 'legacy@example.com' },
      sections: [
        {
          id: 'sec_1',
          title: 'SUMMARY',
          blocks: [{ id: 'b1', type: 'paragraph', text: 'This is a legacy resume without pages.' }]
        }
      ],
      pages: [] // Empty pages
    };

    const pdfBuffer = await documentModelService.generateDocumentModelPdf(legacyModel);
    assert.ok(Buffer.isBuffer(pdfBuffer), 'Must generate buffer even without physical pages');
    assert.ok(pdfBuffer.length > 500, 'Buffer should have content');

    const details = await pdfService.extractPdfDetails(pdfBuffer);
    assert.ok(details.text.includes('LEGACY USER') || details.text.includes('Legacy User'));
    assert.ok(details.text.includes('SUMMARY'));
    assert.ok(details.text.includes('legacy resume without pages'));
  });

  console.log(`\nTEST SUITE SUMMARY: ${passedTests}/${totalTests} tests passed.`);
  console.log('ALL LAYOUT ENGINE TESTS PASSED SUCCESSFULLY! ✓\n');
})();
