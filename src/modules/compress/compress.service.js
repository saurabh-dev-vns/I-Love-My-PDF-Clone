const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const { buildOutputPath } = require('../../utils/fileHelper');

/**
 * Basic compression: strips metadata and re-saves with object streams,
 * which pdf-lib uses to reduce size for most text-based PDFs.
 * NOTE: For image-heavy PDFs, real compression needs image re-encoding
 * (e.g. via Ghostscript) — that can be added here later as another step.
 * @returns {Promise<{ outputPath: string, originalSize: number, newSize: number }>}
 */
async function compressPdf(filePath) {
  const bytes = await fs.readFile(filePath);
  const originalSize = bytes.length;

  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('');
  doc.setCreator('');

  const outputBytes = await doc.save({ useObjectStreams: true });
  const outputPath = buildOutputPath('compressed', 'pdf');
  await fs.writeFile(outputPath, outputBytes);

  return { outputPath, originalSize, newSize: outputBytes.length };
}

module.exports = { compressPdf };
