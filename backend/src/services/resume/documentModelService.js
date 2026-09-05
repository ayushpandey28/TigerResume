const PDFDocument = require('pdfkit');
const logger = require('../../utils/logger');

/**
 * Universal Document Model Engine
 * Preserves the actual uploaded document's layout, custom sections, bullets,
 * key-value pairs, and paragraphs without hardcoding any entities, job titles,
 * names, degrees, or section dictionaries.
 */

// Universal bullet marker regex
const BULLET_REGEX = /^([•●▪◦⁃‣\-–*○]|(?:\d+[\.\)]|[a-zA-Z][\.\)]))\s+(.*)$/;

// Normalize raw text streams safely
const cleanString = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/%Ï/g, '\n')
    .replace(/\uFFFD/g, '')
    .trim();
};

/**
 * Detect if a line represents a generic section heading based purely on typography & layout.
 * ZERO hardcoded heading strings.
 */
const isGenericHeading = (line, prevLine = '', nextLine = '', lineIndex = 0, headerEndIdx = -1) => {
  if (!line) return false;
  const trimmed = line.trim();
  if (trimmed.length < 2 || trimmed.length > 55) return false;

  // Lines at or before header boundary cannot be section headings
  if (lineIndex <= headerEndIdx) return false;

  // Bullets or numbered list items with sentence text are NOT section headings
  if (/^[•●▪◦⁃‣\-–*○]\s+/.test(trimmed)) return false;
  if (/^\d+[\.\)]\s+[a-z]/.test(trimmed)) return false;

  // Cannot end with sentence punctuation
  if (/[.!?]$/.test(trimmed)) return false;

  // Avoid email, url, phone, pipe lines
  if (trimmed.includes('@') || trimmed.includes('http') || trimmed.includes('.com') || trimmed.includes('|')) return false;

  // 1. Markdown headings (# Heading)
  if (/^#{1,4}\s+[A-Za-z0-9]/.test(trimmed)) return true;

  // 2. Roman numeral or explicit section prefix heading (I. Heading, II. Heading, Section 1: Heading)
  if (/^(?:[IVXLCDM]+[\.\)]|Section\s+\d+[\.\:]?)\s+[A-Za-z]/i.test(trimmed)) {
    if (!/,\s|and\s|with\s|for\s|to\s/i.test(trimmed) || trimmed.length < 35) {
      return true;
    }
  }

  // 3. Pure uppercase heading (e.g. PROFESSIONAL EXPERIENCE, CORE SKILLS, PATENTS, EXHIBITIONS)
  // Must contain at least 3 uppercase letters, optional spaces, slashes, ampersands, dashes
  const lettersOnly = trimmed.replace(/[^A-Za-z]/g, '');
  if (lettersOnly.length >= 3) {
    const isAllUpper = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
    if (isAllUpper) {
      return true;
    }
  }

  // 4. Standalone Title Case line preceded by blank line and followed by text (must be after header)
  if (lineIndex > 0 && !prevLine && nextLine && trimmed.length <= 40) {
    const withoutColon = trimmed.replace(/:$/, '');
    const words = withoutColon.split(/\s+/);
    if (words.length >= 1 && words.length <= 5) {
      const isTitleCase = words.every(w => /^[A-Z]/.test(w) || /^(and|of|in|for|&|\/)$/i.test(w));
      if (isTitleCase && !/[,;]/.test(withoutColon)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Identify the boundary of the top candidate header
 */
const findHeaderEndIndex = (lines) => {
  let headerEnd = -1;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,5}[\s.-]?\d{4,6}/;

  // Scan up to first 8 lines
  const maxScan = Math.min(lines.length, 8);
  for (let i = 0; i < maxScan; i++) {
    const line = lines[i];
    if (emailRegex.test(line) || phoneRegex.test(line) || line.includes('|') || line.includes('linkedin.com') || line.includes('github.com')) {
      headerEnd = i;
    }
  }

  // If candidate name was line 0 and contact was lines 1-2, headerEnd is at least 1
  if (headerEnd === -1 && lines.length > 0) {
    headerEnd = 0;
  }

  return headerEnd;
};

/**
 * Extract contact/header lines from top of document before first section
 */
const extractHeader = (lines, firstHeadingIdx) => {
  const headerLines = (firstHeadingIdx > 0 ? lines.slice(0, firstHeadingIdx) : lines.slice(0, 3))
    .map(l => l.trim())
    .filter(Boolean);

  const header = {
    name: '',
    email: '',
    phone: '',
    location: '',
    links: [],
    rawLines: headerLines
  };

  if (headerLines.length === 0) {
    return header;
  }

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,5}[\s.-]?\d{4,6}/;
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s,|]*)?)/gi;

  // First non-contact line is typically the candidate's name
  for (let i = 0; i < headerLines.length; i++) {
    const line = headerLines[i];
    const hasEmail = emailRegex.test(line);
    const hasPhone = phoneRegex.test(line);
    const hasUrl = /linkedin\.com|github\.com|http/i.test(line);

    if (!header.name && !hasEmail && !hasPhone && !hasUrl && line.length < 50 && !line.includes('|')) {
      header.name = line.replace(/^#+\s*/, '').trim();
    }

    if (!header.email) {
      const match = line.match(emailRegex);
      if (match) header.email = match[1];
    }

    if (!header.phone) {
      const match = line.match(phoneRegex);
      if (match && match[0].replace(/\D/g, '').length >= 9) {
        header.phone = match[0].trim();
      }
    }

    // Extract links
    let match;
    while ((match = urlRegex.exec(line)) !== null) {
      const full = match[0];
      if (!full.includes('@') && !header.links.includes(full)) {
        header.links.push(full);
      }
    }

    // Location heuristic (City, State/Country containing a comma, or Remote/Hybrid)
    if (!header.location) {
      const parts = line.split(/[|•]/).map(p => p.trim());
      for (const part of parts) {
        if (!emailRegex.test(part) && !phoneRegex.test(part) && !/linkedin|github|http|\.com/i.test(part)) {
          if (part !== header.name && (/[A-Za-z\s]+,\s*[A-Za-z\s]+/.test(part) || /^(Remote|Hybrid)$/i.test(part))) {
            header.location = part;
          }
        }
      }
    }
  }

  return header;
};

/**
 * Parse raw extracted text into a structured, layout-preserving Document Model
 */
const buildDocumentModel = (rawText, metadata = {}) => {
  const cleaned = cleanString(rawText);
  if (!cleaned) {
    return {
      version: 1,
      documentModelVersion: '1.0',
      sourceType: metadata.fileType || 'pdf',
      fileName: metadata.fileName || 'document.pdf',
      pageCount: metadata.pageCount || 1,
      pages: Array.isArray(metadata.pages) ? metadata.pages : [],
      header: { name: '', email: '', phone: '', location: '', links: [], rawLines: [] },
      sections: []
    };
  }

  const rawLines = cleaned.split('\n');
  const lines = [];

  for (const l of rawLines) {
    lines.push(l.trim());
  }

  const headerEndIdx = findHeaderEndIndex(lines);

  // Find all heading line indices
  const headingIndices = [];
  for (let i = 0; i < lines.length; i++) {
    const prev = i > 0 ? lines[i - 1] : '';
    const next = i < lines.length - 1 ? lines[i + 1] : '';
    if (isGenericHeading(lines[i], prev, next, i, headerEndIdx)) {
      headingIndices.push(i);
    }
  }

  const firstHeadingIdx = headingIndices.length > 0 ? headingIndices[0] : (headerEndIdx + 1);
  const header = extractHeader(lines, firstHeadingIdx);

  const sections = [];
  let secCounter = 1;

  // If there are lines before the first heading that aren't purely contact info,
  // or if no headings were detected at all, make a top section
  if (headingIndices.length === 0) {
    const bodyLines = lines.slice(firstHeadingIdx).filter(Boolean);
    if (bodyLines.length > 0) {
      sections.push(parseSectionBlocks('sec_1', 'DOCUMENT CONTENT', bodyLines));
    }
    return {
      version: 1,
      documentModelVersion: '1.0',
      sourceType: metadata.fileType || 'pdf',
      fileName: metadata.fileName || 'document.pdf',
      pageCount: metadata.pageCount || (metadata.pages && metadata.pages.length) || 1,
      pages: Array.isArray(metadata.pages) ? metadata.pages : [],
      header,
      sections
    };
  }

  // Build each section from headingIndices
  for (let h = 0; h < headingIndices.length; h++) {
    const startIdx = headingIndices[h];
    const endIdx = h < headingIndices.length - 1 ? headingIndices[h + 1] : lines.length;
    const headingRaw = lines[startIdx];
    const cleanTitle = headingRaw
      .replace(/^#+\s*/, '')
      .replace(/^(?:[IVXLCDM]+|[0-9]{1,2})[\.\:\)]\s*/, '')
      .replace(/:$/, '')
      .trim();

    const secLines = lines.slice(startIdx + 1, endIdx);
    const secId = `sec_${secCounter++}`;
    sections.push(parseSectionBlocks(secId, cleanTitle, secLines, headingRaw));
  }

  return {
    version: 1,
    documentModelVersion: '1.0',
    sourceType: metadata.fileType || 'pdf',
    fileName: metadata.fileName || 'document.pdf',
    pageCount: metadata.pageCount || (metadata.pages && metadata.pages.length) || 1,
    pages: Array.isArray(metadata.pages) ? metadata.pages : [],
    header,
    sections
  };
};

/**
 * Parses the lines within a section into blocks:
 * bullets, key_value pairs, and paragraphs, preserving order and wrapping.
 */
const parseSectionBlocks = (sectionId, title, lines, rawTitle = '') => {
  const blocks = [];
  let blkCounter = 1;
  let currentBullet = null;
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        blocks.push({
          id: `${sectionId}_blk_${blkCounter++}`,
          type: 'paragraph',
          text
        });
      }
      currentParagraph = [];
    }
  };

  const flushBullet = () => {
    if (currentBullet) {
      blocks.push(currentBullet);
      currentBullet = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      // Empty line signals boundary between blocks
      flushBullet();
      flushParagraph();
      continue;
    }

    // Check if line is a bullet item
    const bulletMatch = line.match(BULLET_REGEX);
    if (bulletMatch) {
      flushParagraph();
      flushBullet();

      const marker = bulletMatch[1];
      const text = bulletMatch[2].trim();

      currentBullet = {
        id: `${sectionId}_blk_${blkCounter++}`,
        type: 'bullet',
        marker,
        text,
        level: 0
      };
      continue;
    }

    // Check if line is a subheading (e.g. "Low-Latency Packet Filter:", "Distributed Rate Limiter:")
    if (/^[A-Za-z0-9\s\/&-]{2,50}:$/.test(line)) {
      flushParagraph();
      flushBullet();
      blocks.push({
        id: `${sectionId}_blk_${blkCounter++}`,
        type: 'heading',
        text: line.replace(/:$/, '').trim()
      });
      continue;
    }

    // Check if line is a key-value pair (e.g. "Languages: C++, Python", "Frameworks: React, Express")
    const kvMatch = line.match(/^([A-Za-z0-9\s\/&-]{2,35}):\s+(.*)$/);
    if (kvMatch && !kvMatch[1].toLowerCase().startsWith('http')) {
      flushParagraph();
      flushBullet();

      blocks.push({
        id: `${sectionId}_blk_${blkCounter++}`,
        type: 'key_value',
        key: kvMatch[1].trim(),
        value: kvMatch[2].trim(),
        text: line
      });
      continue;
    }

    // If we are currently tracking a bullet and this line looks like a continuation
    if (currentBullet) {
      // If line is short and doesn't end a sentence, or lowercase start, join it
      if (line.length > 0 && (!/^[A-Z]/.test(line) || currentBullet.text.length < 50 || !/[.!?]$/.test(currentBullet.text))) {
        currentBullet.text += ` ${line}`;
        continue;
      } else {
        flushBullet();
      }
    }

    // Otherwise, collect into paragraph
    currentParagraph.push(line);
  }

  flushBullet();
  flushParagraph();

  return {
    id: sectionId,
    title,
    rawTitle: rawTitle || title,
    level: 1,
    blocks
  };
};

/**
 * High-fidelity PDF generator from Document Model
 * Preserves user's actual sections, headings, bullets, and layout.
 */
const generateDocumentModelPdf = async (documentModel, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!documentModel || typeof documentModel !== 'object') {
        return reject(new Error('Invalid document model provided'));
      }

      // Check if physical pages with positioned elements exist
      const hasPhysicalPages = Array.isArray(documentModel.pages) &&
        documentModel.pages.length > 0 &&
        documentModel.pages.some(p => Array.isArray(p.elements) && p.elements.length > 0);

      if (hasPhysicalPages) {
        const doc = new PDFDocument({
          autoFirstPage: false,
          pdfVersion: '1.5'
        });

        const buffers = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));

        for (const page of documentModel.pages) {
          const w = Number(page.width) || 595.28;
          const h = Number(page.height) || 841.89;
          doc.addPage({ size: [w, h], margin: 0 });

          const elements = Array.isArray(page.elements) ? page.elements : [];
          for (const el of elements) {
            if (!el.text) continue;

            const fontSize = Math.max(Number(el.fontSize) || 10, 4);
            const isBold = el.fontWeight === 'bold' || el.fontWeight >= 600;
            const isItalic = el.fontStyle === 'italic';
            const font = isBold && isItalic ? 'Helvetica-BoldOblique' :
                         isBold ? 'Helvetica-Bold' :
                         isItalic ? 'Helvetica-Oblique' : 'Helvetica';

            const color = el.color || '#1E293B';
            const x = typeof el.x === 'number' ? el.x : 50;
            const y = typeof el.y === 'number' ? el.y : 50;

            doc
              .font(font)
              .fontSize(fontSize)
              .fillColor(color)
              .text(String(el.text), x, y, {
                lineBreak: false,
                ellipsis: false
              });
          }
        }

        doc.end();
        return;
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        pdfVersion: '1.4'
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const {
        primaryColor = '#1E293B',
        accentColor = '#0284C7',
        textColor = '#334155',
        mutedColor = '#64748B'
      } = options;

      const header = documentModel.header || {};
      const candidateName = header.name || options.title || 'Resume';

      // 1. Render Candidate Header
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(primaryColor)
        .text(candidateName, { align: 'center' });

      doc.moveDown(0.3);

      const contactItems = [];
      if (header.phone) contactItems.push(header.phone);
      if (header.email) contactItems.push(header.email);
      if (header.location) contactItems.push(header.location);
      if (Array.isArray(header.links)) {
        header.links.forEach(l => {
          contactItems.push(l.replace(/^https?:\/\//, ''));
        });
      }

      if (contactItems.length > 0) {
        doc
          .font('Helvetica')
          .fontSize(9.5)
          .fillColor(mutedColor)
          .text(contactItems.join('  •  '), { align: 'center' });
      }

      doc.moveDown(0.6);

      // Accent divider line below header
      const startX = doc.page.margins.left;
      const endX = doc.page.width - doc.page.margins.right;
      doc
        .strokeColor('#CBD5E1')
        .lineWidth(1)
        .moveTo(startX, doc.y)
        .lineTo(endX, doc.y)
        .stroke();

      doc.moveDown(0.8);

      // 2. Render Sections in Original Sequence
      const sections = Array.isArray(documentModel.sections) ? documentModel.sections : [];

      for (const section of sections) {
        // Page boundary check
        if (doc.y > doc.page.height - 90) {
          doc.addPage();
        }

        // Section Title
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(primaryColor)
          .text(section.title.toUpperCase(), { lineGap: 2 });

        const secY = doc.y;
        doc
          .strokeColor(accentColor)
          .lineWidth(1.5)
          .moveTo(startX, secY)
          .lineTo(startX + 140, secY)
          .stroke();

        doc.moveDown(0.5);

        // Section Blocks
        const blocks = Array.isArray(section.blocks) ? section.blocks : [];
        for (const block of blocks) {
          // Check page boundary
          if (doc.y > doc.page.height - 60) {
            doc.addPage();
          }

          if (block.type === 'bullet') {
            doc
              .font('Helvetica')
              .fontSize(9.5)
              .fillColor(textColor)
              .text(`•  ${block.text}`, {
                indent: 10,
                lineGap: 3
              });
          } else if (block.type === 'key_value') {
            doc
              .font('Helvetica-Bold')
              .fontSize(9.5)
              .fillColor(primaryColor)
              .text(`${block.key}: `, { continued: true, lineGap: 3 });

            doc
              .font('Helvetica')
              .fontSize(9.5)
              .fillColor(textColor)
              .text(block.value || '', { lineGap: 3 });
          } else if (block.type === 'paragraph') {
            doc
              .font('Helvetica')
              .fontSize(9.5)
              .fillColor(textColor)
              .text(block.text, { lineGap: 3 });
          } else if (block.type === 'heading') {
            doc
              .font('Helvetica-Bold')
              .fontSize(10.5)
              .fillColor(primaryColor)
              .text(block.text, { lineGap: 2 });
          }
        }

        doc.moveDown(0.6);
      }

      doc.end();
    } catch (err) {
      logger.error('Document model PDF generation failed:', err.message);
      reject(err);
    }
  });
};

module.exports = {
  buildDocumentModel,
  generateDocumentModelPdf,
  isGenericHeading
};
