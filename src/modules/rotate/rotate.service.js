const { PDFDocument, degrees } = require('pdf-lib');
const fs = require('fs-extra');
const { buildOutputPath } = require('../../utils/fileHelper');

/**
 * Rotates all pages of a PDF by the given angle (must be multiple of 90).
 * @returns {Promise<string>} absolute path of the rotated output PDF.
 */
async function rotatePdf(filePath, angle) {
  const bytes = await fs.readFile(filePath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });

  const outputBytes = await doc.save();
  const outputPath = buildOutputPath('rotated', 'pdf');
  await fs.writeFile(outputPath, outputBytes);
  return outputPath;
}

module.exports = { rotatePdf };
