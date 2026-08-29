const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const fs = require('fs-extra');
const { buildOutputPath } = require('../../utils/fileHelper');

/**
 * Stamps a diagonal text watermark across every page of a PDF.
 * @returns {Promise<string>} absolute path of the watermarked PDF.
 */
async function addWatermark(filePath, text) {
  const bytes = await fs.readFile(filePath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.35,
      rotate: degrees(45),
    });
  });

  const outputBytes = await doc.save();
  const outputPath = buildOutputPath('watermarked', 'pdf');
  await fs.writeFile(outputPath, outputBytes);
  return outputPath;
}

module.exports = { addWatermark };
