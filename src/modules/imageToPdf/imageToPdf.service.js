const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const sharp = require('sharp');
const { buildOutputPath } = require('../../utils/fileHelper');

/**
 * Converts one or more images (JPG/PNG/WEBP) into a single multi-page PDF,
 * one image per page, sized to fit an A4-ish page while preserving aspect ratio.
 * @param {string[]} imagePaths - absolute paths, in the desired page order.
 * @returns {Promise<string>} absolute path of the generated PDF.
 */
async function imagesToPdf(imagePaths) {
  const doc = await PDFDocument.create();
  const PAGE_WIDTH = 595.28; // A4 width in points
  const PAGE_HEIGHT = 841.89; // A4 height in points

  for (const imgPath of imagePaths) {
    // Normalize everything to PNG bytes via sharp so pdf-lib can embed it
    // consistently, regardless of original format (jpg/png/webp).
    const pngBuffer = await sharp(imgPath).png().toBuffer();
    const embeddedImage = await doc.embedPng(pngBuffer);

    const { width: imgW, height: imgH } = embeddedImage.scale(1);
    const scale = Math.min(PAGE_WIDTH / imgW, PAGE_HEIGHT / imgH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawImage(embeddedImage, {
      x: (PAGE_WIDTH - drawW) / 2,
      y: (PAGE_HEIGHT - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  const outputBytes = await doc.save();
  const outputPath = buildOutputPath('images', 'pdf');
  await fs.writeFile(outputPath, outputBytes);
  return outputPath;
}

module.exports = { imagesToPdf };
