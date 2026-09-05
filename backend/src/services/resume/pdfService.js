const PDFDocument = require('pdfkit');
const pdfParse = require('pdf-parse');
const zlib = require('zlib');
const { normalizeResumeData } = require('../../utils/resumeNormalizer');
const logger = require('../../utils/logger');

const fallbackExtractPdfText = (pdfBuffer) => {
  const textPieces = [];
  const bufStr = pdfBuffer.toString('binary');
  let startIdx = 0;

  while ((startIdx = bufStr.indexOf('stream', startIdx)) !== -1) {
    let contentStart = startIdx + 6;
    if (bufStr[contentStart] === '\r') contentStart++;
    if (bufStr[contentStart] === '\n') contentStart++;

    const endIdx = bufStr.indexOf('endstream', contentStart);
    if (endIdx === -1) break;

    const rawChunk = pdfBuffer.slice(contentStart, endIdx);
    let decompressed = null;
    try {
      decompressed = zlib.inflateSync(rawChunk).toString('utf-8');
    } catch (e) {
      try {
        decompressed = zlib.inflateRawSync(rawChunk).toString('utf-8');
      } catch (e2) {
        decompressed = rawChunk.toString('latin1');
      }
    }

    if (decompressed) {
      const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
      let match;
      while ((match = tjRegex.exec(decompressed)) !== null) {
        textPieces.push(match[1]);
      }

      const arrayRegex = /\[([^\]]+)\]\s*TJ/g;
      while ((match = arrayRegex.exec(decompressed)) !== null) {
        const subMatches = match[1].match(/\(([^)]+)\)|<([0-9a-fA-F]+)>/g);
        if (subMatches) {
          const str = subMatches.map(m => {
            if (m.startsWith('(')) return m.slice(1, -1);
            if (m.startsWith('<')) {
              const hex = m.slice(1, -1);
              return Buffer.from(hex, 'hex').toString('latin1');
            }
            return '';
          }).join('');
          if (str.trim()) textPieces.push(str);
        }
      }
    }
    startIdx = endIdx + 9;
  }
  return textPieces.join('\n').trim();
};

const consolidateLineElements = (rawItems, pageNum) => {
  if (!rawItems || rawItems.length === 0) return [];

  // Sort items by y (top to bottom), then x (left to right)
  const sorted = [...rawItems].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 3) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const consolidated = [];
  let current = null;

  for (const item of sorted) {
    if (!item.str || !item.str.trim()) continue;

    const isBold = /bold|black|heavy|medium/i.test(item.fontName || '');
    const isItalic = /italic|oblique/i.test(item.fontName || '');

    if (!current) {
      current = {
        id: `el_${pageNum}_${consolidated.length + 1}`,
        type: item.fontSize >= 13 ? 'heading' : (item.str.trim().startsWith('•') || item.str.trim().startsWith('-') ? 'bullet' : 'text'),
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        text: item.str,
        fontSize: item.fontSize,
        fontFamily: 'Helvetica',
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        color: '#1E293B',
        alignment: 'left',
        zIndex: consolidated.length + 1
      };
      continue;
    }

    const sameLine = Math.abs(item.y - current.y) <= 3.5;
    const currentRight = current.x + current.width;
    const gap = item.x - currentRight;
    const sameColumn = gap >= -2 && gap <= 24;
    const sameStyle = Math.abs(item.fontSize - current.fontSize) <= 1.5 &&
                      (isBold ? 'bold' : 'normal') === current.fontWeight;

    if (sameLine && sameColumn && sameStyle) {
      const needSpace = gap > 1.5 && !current.text.endsWith(' ') && !item.str.startsWith(' ');
      current.text = current.text + (needSpace ? ' ' : '') + item.str;
      current.width = Math.round(((item.x + item.width) - current.x) * 100) / 100;
      current.height = Math.round(Math.max(current.height, item.height) * 100) / 100;
      if (current.text.trim().startsWith('•') || current.text.trim().startsWith('-')) {
        current.type = 'bullet';
      }
    } else {
      consolidated.push(current);
      current = {
        id: `el_${pageNum}_${consolidated.length + 1}`,
        type: item.fontSize >= 13 ? 'heading' : (item.str.trim().startsWith('•') || item.str.trim().startsWith('-') ? 'bullet' : 'text'),
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        text: item.str,
        fontSize: item.fontSize,
        fontFamily: 'Helvetica',
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        color: '#1E293B',
        alignment: 'left',
        zIndex: consolidated.length + 1
      };
    }
  }

  if (current) {
    consolidated.push(current);
  }

  return consolidated;
};

const extractPdfDetails = async (pdfBuffer) => {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error('Invalid PDF buffer provided');
  }

  let text = '';
  let pageCount = 1;
  let info = {};
  const pages = [];

  try {
    const uint8 = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);
    let pageIndex = 0;

    const options = {
      pagerender: async function (pageData) {
        pageIndex++;
        const textContent = await pageData.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false
        });

        const view = pageData.view || [0, 0, 595.28, 841.89];
        const width = Math.round((view[2] - view[0]) * 100) / 100;
        const height = Math.round((view[3] - view[1]) * 100) / 100;

        const rawElements = [];
        for (const item of textContent.items) {
          const tx = item.transform[4];
          const ty = item.transform[5];
          const fontHeight = Math.abs(item.transform[3]) || item.height || 10;
          const ascent = fontHeight * 0.72;
          const top = height - ty - ascent;

          rawElements.push({
            str: item.str,
            x: Math.round(tx * 100) / 100,
            y: Math.round(top * 100) / 100,
            width: Math.round((item.width || 0) * 100) / 100,
            height: Math.round(fontHeight * 100) / 100,
            fontSize: Math.round(fontHeight * 10) / 10,
            fontName: item.fontName
          });
        }

        let annotations = [];
        try {
          if (typeof pageData.getAnnotations === 'function') {
            const rawAnnots = await pageData.getAnnotations();
            if (Array.isArray(rawAnnots)) {
              annotations = rawAnnots.map(a => ({
                subtype: a.subtype,
                url: a.url || (a.A && a.A.URI) || '',
                rect: a.rect
              }));
            }
          }
        } catch (annErr) {
          // annotations optional
        }

        const consolidated = consolidateLineElements(rawElements, pageIndex);

        pages.push({
          pageNumber: pageIndex,
          width,
          height,
          elements: consolidated,
          annotations
        });

        let lastY, pageText = '';
        for (const item of textContent.items) {
          if (lastY === undefined || Math.abs(lastY - item.transform[5]) < 2) {
            pageText += item.str;
          } else {
            pageText += '\n' + item.str;
          }
          lastY = item.transform[5];
        }

        return pageText;
      }
    };

    const data = await pdfParse(uint8, options);
    text = data.text ? data.text.trim() : '';
    pageCount = pages.length > 0 ? pages.length : (data.numpages || 1);
    info = data.info || {};
  } catch (err) {
    logger.warn('pdf-parse primary extraction warning:', err.message, '— utilizing stream fallback.');
    text = fallbackExtractPdfText(pdfBuffer);
    const raw = pdfBuffer.toString('binary');
    const pageMatches = raw.match(/\/Type\s*\/Page(?![s\w])/g);
    pageCount = pageMatches ? pageMatches.length : 1;
  }

  return { text, pageCount, pages, info };
};

const extractText = async (pdfBuffer) => {
  const details = await extractPdfDetails(pdfBuffer);
  return details.text;
};

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/%Ï/g, '\n')
    .replace(/[•‣▪◦⁃●]/g, '\n')
    .replace(/\uFFFD/g, '')
    .trim();
};

const getBulletItems = (value) => {
  if (!value) return [];

  return cleanText(value)
    .split('\n')
    .map(item => item.replace(/^[-•‣▪◦⁃●\s]+/, '').trim())
    .filter(Boolean);
};

const drawBullets = (doc, items, options = {}) => {
  const {
    fontSize = 9.5,
    color = '#334155',
    lineHeight = 1.25
  } = options;

  items.forEach(item => {
    doc
      .fillColor(color)
      .fontSize(fontSize)
      .font('Helvetica')
      .text(`- ${item}`, {
        lineHeight
      });
  });
};

const generatePdfBuffer = async ({
  resume,
  templateId = 'classic',
  customization = {}
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        pdfVersion: '1.5'
      });

      const buffers = [];

      doc.on('data', chunk => {
        buffers.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      doc.on('error', err => {
        reject(err);
      });

      const normResume = normalizeResumeData(resume);
      const contact = normResume.contact || {};
      const summary = cleanText(normResume.summary);
      const skills = Array.isArray(normResume.skills) ? normResume.skills : [];
      const skillCategories = Array.isArray(normResume.skillCategories) ? normResume.skillCategories : [];
      const experience = Array.isArray(normResume.experience) ? normResume.experience : [];
      const projects = Array.isArray(normResume.projects) ? normResume.projects : [];
      const education = Array.isArray(normResume.education) ? normResume.education : [];
      const certifications = Array.isArray(normResume.certifications) ? normResume.certifications : [];
      const achievements = Array.isArray(normResume.achievements) ? normResume.achievements : [];

      const colorMap = {
        default:
          templateId === 'creative'
            ? '#7C3AED'
            : templateId === 'modern'
              ? '#2563EB'
              : '#1E293B',
        blue: '#2563EB',
        green: '#059669',
        dark: '#0F172A'
      };

      const primaryColor =
        colorMap[customization.accentColor] || colorMap.default;

      const marginLeft = doc.page.margins.left;
      const marginRight = doc.page.margins.right;
      const contentWidth = doc.page.width - marginLeft - marginRight;
      const bottomLimit = () => doc.page.height - doc.page.margins.bottom;

      const ensureSpace = (neededHeight) => {
        if (doc.y + neededHeight > bottomLimit()) {
          doc.addPage();
          return true;
        }
        return false;
      };

      // Header
      const candidateName =
        cleanText(contact.name) ||
        cleanText(resume.title) ||
        'Resume Candidate';

      const contactParts = [
        contact.email,
        contact.phone,
        contact.location,
        contact.linkedin,
        contact.github,
        contact.website
      ].filter(Boolean).map(c => String(c).trim());

      if (templateId === 'creative') {
        // Creative Header Card
        const cardStartY = doc.y;
        doc.fillColor(primaryColor).fontSize(22).font('Helvetica-Bold').text(candidateName, marginLeft + 12, cardStartY + 10, {
          width: contentWidth - 24
        });
        doc.moveDown(0.2);

        if (contactParts.length > 0) {
          doc.fillColor('#475569').fontSize(9).font('Helvetica').text(contactParts.join('  |  '), marginLeft + 12, doc.y, {
            width: contentWidth - 24
          });
        }
        const cardHeight = Math.max(50, doc.y - cardStartY + 10);
        doc.roundedRect(marginLeft, cardStartY, contentWidth, cardHeight, 6)
          .strokeColor('#E2E8F0')
          .lineWidth(1)
          .stroke();
        doc.y = cardStartY + cardHeight + 14;
      } else if (templateId === 'modern') {
        // Modern Header with Left Bar
        const barStartY = doc.y;
        doc.fillColor(primaryColor).fontSize(22).font('Helvetica-Bold').text(candidateName, marginLeft + 12, barStartY, {
          width: contentWidth - 12
        });
        doc.moveDown(0.2);

        if (contactParts.length > 0) {
          doc.fillColor('#4B5563').fontSize(9.5).font('Helvetica').text(contactParts.join('  |  '), marginLeft + 12, doc.y, {
            width: contentWidth - 12
          });
        }
        const barHeight = doc.y - barStartY;
        doc.strokeColor(primaryColor).lineWidth(4).moveTo(marginLeft, barStartY).lineTo(marginLeft, barStartY + barHeight).stroke();
        doc.y = doc.y + 14;
      } else {
        // Classic Header
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text(candidateName);
        doc.moveDown(0.2);

        if (contactParts.length > 0) {
          doc.fillColor('#475569').fontSize(9).font('Helvetica').text(contactParts.join('  |  '));
        }
        doc.moveDown(0.3);
        doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(marginLeft, doc.y).lineTo(marginLeft + contentWidth, doc.y).stroke();
        doc.moveDown(0.4);
      }

      // Section Heading helper
      const addSectionHeading = (title) => {
        ensureSpace(45);
        doc.moveDown(0.4);

        const heading = String(title).toUpperCase();

        if (templateId === 'modern') {
          doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text(heading);
          doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(marginLeft, doc.y + 2).lineTo(marginLeft + contentWidth, doc.y + 2).stroke();
          doc.y += 6;
        } else if (templateId === 'creative') {
          doc.fillColor(primaryColor).fontSize(12.5).font('Helvetica-Bold').text(heading);
          doc.strokeColor(primaryColor).lineWidth(1).moveTo(marginLeft, doc.y + 2).lineTo(marginLeft + 40, doc.y + 2).stroke();
          doc.y += 6;
        } else {
          doc.fillColor('#1E293B').fontSize(11.5).font('Helvetica-Bold').text(heading);
          doc.strokeColor('#E2E8F0').lineWidth(0.75).moveTo(marginLeft, doc.y + 2).lineTo(marginLeft + contentWidth, doc.y + 2).stroke();
          doc.y += 5;
        }
      };

      // Summary
      if (summary) {
        addSectionHeading('Professional Summary');
        ensureSpace(25);
        doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(summary, {
          lineHeight: 1.3,
          width: contentWidth
        });
      }

      // Skills
      if (skillCategories.length > 0 || skills.length > 0) {
        addSectionHeading('Skills & Competencies');
        if (skillCategories.length > 0) {
          skillCategories.forEach(cat => {
            ensureSpace(18);
            const catName = cleanText(cat.name || 'Core Skills');
            const catSkills = (Array.isArray(cat.skills) ? cat.skills : []).map(cleanText).filter(Boolean).join(', ');
            if (catSkills) {
              doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryColor).text(`${catName}: `, marginLeft, doc.y, {
                continued: true
              });
              doc.font('Helvetica').fillColor('#334155').text(catSkills);
              doc.moveDown(0.15);
            }
          });
        } else if (skills.length > 0) {
          ensureSpace(20);
          const skillText = skills.map(cleanText).filter(Boolean).join('  •  ');
          doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(skillText, {
            width: contentWidth,
            lineHeight: 1.25
          });
        }
      }

      // Work Experience
      if (experience.length > 0) {
        addSectionHeading('Work Experience');

        experience.forEach(exp => {
          ensureSpace(50);

          const title = cleanText(exp.title || 'Role');
          const duration = cleanText(exp.duration || '');
          const company = cleanText(exp.company || '');
          const location = cleanText(exp.location || '');

          const startY = doc.y;

          if (duration) {
            doc.fontSize(9).font('Helvetica').fillColor('#64748B').text(`(${duration})`, marginLeft + contentWidth - 140, startY, {
              width: 140,
              align: 'right'
            });
          }

          doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0F172A').text(title, marginLeft, startY, {
            width: duration ? contentWidth - 145 : contentWidth
          });

          const companyLine = [company, location].filter(Boolean).join('  |  ');
          if (companyLine) {
            doc.fontSize(9.5).font('Helvetica-Oblique').fillColor(templateId === 'creative' || templateId === 'modern' ? primaryColor : '#475569').text(companyLine, marginLeft, doc.y, {
              width: contentWidth
            });
          }

          const bullets = (exp.bullets && exp.bullets.length > 0)
            ? exp.bullets
            : getBulletItems(exp.description);

          if (bullets.length > 0) {
            bullets.forEach(bullet => {
              ensureSpace(18);
              const cleanB = cleanText(bullet);
              if (cleanB) {
                const bulletY = doc.y;
                doc.fontSize(9.5).font('Helvetica').fillColor(primaryColor).text('•', marginLeft + 4, bulletY);
                doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(cleanB, marginLeft + 16, bulletY, {
                  width: contentWidth - 16,
                  lineHeight: 1.25
                });
              }
            });
          }

          doc.moveDown(0.3);
        });
      }

      // Projects
      if (projects.length > 0) {
        addSectionHeading('Projects');

        projects.forEach(project => {
          ensureSpace(45);

          const name = cleanText(project.name || 'Project');
          const link = cleanText(project.link || '');
          const startY = doc.y;

          if (link) {
            doc.fontSize(9).font('Helvetica').fillColor(primaryColor).text(link, marginLeft + contentWidth - 180, startY, {
              width: 180,
              align: 'right'
            });
          }

          doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text(name, marginLeft, startY, {
            width: link ? contentWidth - 185 : contentWidth
          });

          const techs = Array.isArray(project.technologies)
            ? project.technologies.join(', ')
            : cleanText(project.technologies || '');

          if (techs) {
            doc.fontSize(9).font('Helvetica-Oblique').fillColor('#475569').text(`Technologies: ${techs}`, marginLeft, doc.y, {
              width: contentWidth
            });
          }

          const bullets = (project.bullets && project.bullets.length > 0)
            ? project.bullets
            : getBulletItems(project.description);

          if (bullets.length > 0) {
            bullets.forEach(bullet => {
              ensureSpace(18);
              const cleanB = cleanText(bullet);
              if (cleanB) {
                const bulletY = doc.y;
                doc.fontSize(9.5).font('Helvetica').fillColor(primaryColor).text('•', marginLeft + 4, bulletY);
                doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(cleanB, marginLeft + 16, bulletY, {
                  width: contentWidth - 16,
                  lineHeight: 1.25
                });
              }
            });
          }

          doc.moveDown(0.3);
        });
      }

      // Education
      if (education.length > 0) {
        addSectionHeading('Education');

        education.forEach(edu => {
          ensureSpace(35);

          const degree = cleanText(edu.degree || edu.details || 'Degree');
          const year = cleanText(edu.year || '');
          const institution = cleanText(edu.institution || '');
          const cgpa = cleanText(edu.cgpa || '');

          const startY = doc.y;

          if (year) {
            doc.fontSize(9).font('Helvetica').fillColor('#64748B').text(`(${year})`, marginLeft + contentWidth - 120, startY, {
              width: 120,
              align: 'right'
            });
          }

          doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text(degree, marginLeft, startY, {
            width: year ? contentWidth - 125 : contentWidth
          });

          let schoolDetails = institution;
          if (cgpa) {
            schoolDetails += schoolDetails ? `  |  CGPA: ${cgpa}` : `CGPA: ${cgpa}`;
          }

          if (schoolDetails) {
            doc.fontSize(9).font('Helvetica').fillColor('#475569').text(schoolDetails, marginLeft, doc.y, {
              width: contentWidth
            });
          }

          doc.moveDown(0.2);
        });
      }

      // Certifications
      if (certifications.length > 0) {
        addSectionHeading('Certifications');

        certifications.forEach(cert => {
          ensureSpace(18);
          const cleanC = cleanText(cert);
          if (cleanC) {
            const certY = doc.y;
            doc.fontSize(9.5).font('Helvetica').fillColor(primaryColor).text('•', marginLeft + 4, certY);
            doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(cleanC, marginLeft + 16, certY, {
              width: contentWidth - 16,
              lineHeight: 1.25
            });
          }
        });
      }

      // Achievements
      if (achievements.length > 0) {
        addSectionHeading('Achievements & Honors');

        achievements.forEach(achievement => {
          const bullets = getBulletItems(achievement);
          bullets.forEach(bullet => {
            ensureSpace(18);
            const cleanB = cleanText(bullet);
            if (cleanB) {
              const achY = doc.y;
              doc.fontSize(9.5).font('Helvetica').fillColor(primaryColor).text('•', marginLeft + 4, achY);
              doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(cleanB, marginLeft + 16, achY, {
                width: contentWidth - 16,
                lineHeight: 1.25
              });
            }
          });
        });
      }

      // Additional / Generic Sections (e.g. from documentModel.sections or customSections)
      const standardSectionTitles = new Set([
        'SUMMARY', 'PROFESSIONAL SUMMARY', 'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT',
        'PROJECTS', 'KEY PROJECTS', 'EDUCATION', 'SKILLS', 'CORE SKILLS', 'TECHNICAL SKILLS',
        'SKILLS & COMPETENCIES', 'CERTIFICATIONS', 'ACHIEVEMENTS', 'ACHIEVEMENTS & HONORS',
        'DOCUMENT CONTENT'
      ]);

      const additionalSections = [];
      if (Array.isArray(resume.customSections)) {
        additionalSections.push(...resume.customSections);
      }
      if (Array.isArray(resume.documentModel?.sections)) {
        resume.documentModel.sections.forEach(sec => {
          const upper = String(sec.title || '').trim().toUpperCase();
          if (upper && !standardSectionTitles.has(upper)) {
            additionalSections.push(sec);
          }
        });
      }

      if (additionalSections.length > 0) {
        additionalSections.forEach(sec => {
          const secTitle = cleanText(sec.title || 'Additional Information');
          addSectionHeading(secTitle);

          if (Array.isArray(sec.items || sec.elements)) {
            const items = sec.items || sec.elements;
            items.forEach(item => {
              ensureSpace(18);
              const text = cleanText(typeof item === 'string' ? item : (item.text || item.content || item.value || ''));
              if (text) {
                const itemY = doc.y;
                doc.fontSize(9.5).font('Helvetica').fillColor(primaryColor).text('•', marginLeft + 4, itemY);
                doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(text, marginLeft + 16, itemY, {
                  width: contentWidth - 16,
                  lineHeight: 1.25
                });
              }
            });
          } else if (sec.content) {
            ensureSpace(20);
            doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(cleanText(sec.content), {
              width: contentWidth,
              lineHeight: 1.25
            });
          }
        });
      }

      doc.end();
    } catch (err) {
      logger.error('PDF generation failed:', err.message);
      reject(err);
    }
  });
};

module.exports = {
  extractText,
  extractPdfDetails,
  fallbackExtractPdfText,
  generatePdfBuffer
};