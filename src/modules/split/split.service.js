const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const archiver = require('archiver');
const { buildOutputPath } = require('../../utils/fileHelper');

/** Parses a range string like "1-3,5,7-9" into a sorted array of 0-based page indices. */
function parsePageRanges(rangeStr, totalPages) {
  const indices = new Set();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= totalPages) indices.add(i - 1);
      }
    } else {
      const n = Number(part);
      if (n >= 1 && n <= totalPages) indices.add(n - 1);
    }
  }
  return [...indices].sort((a, b) => a - b);
}

/**
 * Extracts the given page range from a PDF into a single new PDF.
 * @returns {Promise<string>} absolute path of the extracted PDF.
 */
async function extractPages(filePath, rangeStr) {
  const bytes = await fs.readFile(filePath);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const indices = parsePageRanges(rangeStr, totalPages);
  if (indices.length === 0) {
    throw new Error('No valid pages found in the given range.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const outputBytes = await newDoc.save();
  const outputPath = buildOutputPath('split', 'pdf');
  await fs.writeFile(outputPath, outputBytes);
  return outputPath;
}

/**
 * Splits every page of a PDF into its own file, zipped together.
 * @returns {Promise<string>} absolute path of the output zip.
 */
async function splitEveryPage(filePath) {
  const bytes = await fs.readFile(filePath);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const zipPath = buildOutputPath('split-pages', 'zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const zipDone = new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });
  archive.pipe(output);

  for (let i = 0; i < totalPages; i++) {
    const newDoc = await PDFDocument.create();
    const [page] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(page);
    const pageBytes = await newDoc.save();
    archive.append(Buffer.from(pageBytes), { name: `page-${i + 1}.pdf` });
  }

  await archive.finalize();
  await zipDone;
  return zipPath;
}

module.exports = { extractPages, splitEveryPage, parsePageRanges };
