const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const { buildOutputPath } = require('../../utils/fileHelper');

/**
 * Merges multiple PDF files (in the given order) into a single PDF.
 * @param {string[]} filePaths - absolute paths of uploaded PDFs, in order.
 * @returns {Promise<string>} absolute path of the merged output PDF.
 */
async function mergePdfs(filePaths) {
  const mergedPdf = await PDFDocument.create();

  for (const filePath of filePaths) {
    const bytes = await fs.readFile(filePath);
    const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const outputBytes = await mergedPdf.save();
  const outputPath = buildOutputPath('merged', 'pdf');
  await fs.writeFile(outputPath, outputBytes);
  return outputPath;
}

module.exports = { mergePdfs };
