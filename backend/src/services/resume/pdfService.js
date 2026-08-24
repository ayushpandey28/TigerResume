const PDFDocument = require('pdfkit');
const pdfParse = require('pdf-parse');
const logger = require('../../utils/logger');

const extractText = async (pdfBuffer) => {
  try {
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Invalid PDF buffer provided');
    }

    const data = await pdfParse(pdfBuffer);
    return data.text ? data.text.trim() : '';
  } catch (err) {
    logger.error('PDF text extraction failed:', err.message);
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
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
        margin: 36
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

      const contact = resume.contact || {};

      const summary = cleanText(resume.summary);

      const skills = Array.isArray(resume.skills)
        ? resume.skills
        : [];

      const experience = Array.isArray(resume.experience)
        ? resume.experience
        : [];

      const projects = Array.isArray(resume.projects)
        ? resume.projects
        : [];

      const education = Array.isArray(resume.education)
        ? resume.education
        : [];

      const certifications = Array.isArray(resume.certifications)
        ? resume.certifications
        : [];

      const achievements = Array.isArray(resume.achievements)
        ? resume.achievements
        : [];

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

      // Header
      const candidateName =
        cleanText(contact.name) ||
        cleanText(resume.title) ||
        'Resume Candidate';

      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(candidateName);

      doc.moveDown(0.2);

      const contactInfo = [
        contact.email,
        contact.phone,
        contact.location,
        contact.linkedin,
        contact.github
      ]
        .filter(Boolean)
        .map(item => String(item).trim())
        .join('  |  ');

      if (contactInfo) {
        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica')
          .text(contactInfo);
      }

      doc.moveDown(0.5);

      // Section Heading
      const addSectionHeading = title => {
        doc.moveDown(0.5);

        const heading = String(title)
          .replace(/%Ï/g, '')
          .replace(/[•‣▪◦⁃●]/g, '')
          .trim()
          .toUpperCase();

        if (templateId === 'modern') {
          doc
            .fillColor(primaryColor)
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(heading);

          doc
            .strokeColor(primaryColor)
            .lineWidth(1)
            .moveTo(36, doc.y + 2)
            .lineTo(559, doc.y + 2)
            .stroke();

          doc.moveDown(0.3);
        } else if (templateId === 'creative') {
          doc
            .fillColor(primaryColor)
            .fontSize(13)
            .font('Helvetica-Bold')
            .text(heading);

          doc.moveDown(0.2);
        } else {
          doc
            .fillColor('#1E293B')
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(heading);

          doc.moveDown(0.2);
        }
      };

      // Professional Summary
      if (summary) {
        addSectionHeading('Professional Summary');

        const summaryLines = summary
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);

        summaryLines.forEach(line => {
          doc
            .fillColor('#334155')
            .fontSize(10)
            .font('Helvetica')
            .text(line, {
              lineHeight: 1.3
            });
        });
      }

      // Skills
      if (skills.length > 0) {
        addSectionHeading('Skills');

        const skillText = skills
          .map(skill => {
            return String(skill)
              .replace(/%Ï/g, '')
              .replace(/[•‣▪◦⁃●]/g, '')
              .trim();
          })
          .filter(Boolean)
          .join('  -  ');

        if (skillText) {
          doc
            .fillColor('#334155')
            .fontSize(9.5)
            .font('Helvetica')
            .text(skillText);
        }
      }

      // Work Experience
      if (experience.length > 0) {
        addSectionHeading('Work Experience');

        experience.forEach(exp => {
          const title =
            String(exp.title || 'Role')
              .replace(/%Ï/g, '')
              .trim();

          doc
            .fillColor('#0F172A')
            .fontSize(10.5)
            .font('Helvetica-Bold')
            .text(title, {
              continued: true
            });

          if (exp.duration) {
            doc
              .fillColor('#64748B')
              .fontSize(9)
              .font('Helvetica')
              .text(`   (${exp.duration})`, {
                align: 'right'
              });
          } else {
            doc.text('');
          }

          const companyLine = [
            exp.company,
            exp.location
          ]
            .filter(Boolean)
            .map(item => String(item).trim())
            .join(' - ');

          if (companyLine) {
            doc
              .fillColor('#475569')
              .fontSize(9.5)
              .font('Helvetica-Oblique')
              .text(companyLine);
          }

          if (exp.description) {
            const bullets = getBulletItems(exp.description);

            if (bullets.length > 0) {
              drawBullets(doc, bullets);
            }
          }

          doc.moveDown(0.3);
        });
      }

      // Projects
      if (projects.length > 0) {
        addSectionHeading('Projects');

        projects.forEach(project => {
          const projectName =
            String(project.name || 'Project')
              .replace(/%Ï/g, '')
              .trim();

          doc
            .fillColor('#0F172A')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(projectName);

          if (project.technologies) {
            const technologies = Array.isArray(project.technologies)
              ? project.technologies.join(', ')
              : String(project.technologies);

            doc
              .fillColor('#475569')
              .fontSize(9)
              .font('Helvetica-Oblique')
              .text(technologies.trim());
          }

          if (project.description) {
            const bullets = getBulletItems(project.description);

            if (bullets.length > 0) {
              drawBullets(doc, bullets, {
                fontSize: 9.5,
                color: '#334155',
                lineHeight: 1.25
              });
            }
          }

          doc.moveDown(0.3);
        });
      }

      // Education
      if (education.length > 0) {
        addSectionHeading('Education');

        education.forEach(edu => {
          const degree =
            String(
              edu.degree ||
              edu.details ||
              'Degree'
            )
              .replace(/%Ï/g, '')
              .trim();

          doc
            .fillColor('#0F172A')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(degree, {
              continued: true
            });

          if (edu.year) {
            doc
              .fillColor('#64748B')
              .fontSize(9)
              .font('Helvetica')
              .text(`   (${String(edu.year).trim()})`, {
                align: 'right'
              });
          } else {
            doc.text('');
          }

          if (edu.institution) {
            doc
              .fillColor('#475569')
              .fontSize(9)
              .font('Helvetica')
              .text(String(edu.institution).trim());
          }

          doc.moveDown(0.2);
        });
      }

      // Certifications
      if (certifications.length > 0) {
        addSectionHeading('Certifications');

        certifications.forEach(cert => {
          const bullets = getBulletItems(cert);

          drawBullets(doc, bullets, {
            fontSize: 9.5,
            color: '#334155'
          });
        });
      }

      // Achievements
      if (achievements.length > 0) {
        addSectionHeading('Achievements');

        achievements.forEach(achievement => {
          const bullets = getBulletItems(achievement);

          drawBullets(doc, bullets, {
            fontSize: 9.5,
            color: '#334155'
          });
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
  generatePdfBuffer
};