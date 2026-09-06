/**
 * PDFKit Standard Font Loader & Bundler Guard.
 * Ensures Vercel's Node File Trace (@vercel/nft) static bundler detects
 * and includes all PDFKit standard font metrics in serverless deployment bundles.
 */

try {
  require('pdfkit/standard-fonts/Helvetica');
  require('pdfkit/standard-fonts/HelveticaBold');
  require('pdfkit/standard-fonts/HelveticaOblique');
  require('pdfkit/standard-fonts/HelveticaBoldOblique');
  require('pdfkit/standard-fonts/TimesRoman');
  require('pdfkit/standard-fonts/TimesBold');
  require('pdfkit/standard-fonts/TimesItalic');
  require('pdfkit/standard-fonts/TimesBoldItalic');
  require('pdfkit/standard-fonts/Courier');
  require('pdfkit/standard-fonts/CourierBold');
  require('pdfkit/standard-fonts/CourierOblique');
  require('pdfkit/standard-fonts/CourierBoldOblique');
  require('pdfkit/standard-fonts/Symbol');
  require('pdfkit/standard-fonts/ZapfDingbats');
} catch (err) {
  // Gracefully ignored if fonts are handled differently in other environments
}

module.exports = true;
