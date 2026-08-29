const path = require('path');
const AppError = require('../../utils/AppError');
const { mergePdfs } = require('./merge.service');
const { safeDeleteMany } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/merge', { title: 'Merge PDF', pageScript: 'merge-preview' });
}

async function handleMerge(req, res) {
  const files = req.files;
  if (!files || files.length < 2) {
    throw new AppError('Please upload at least 2 PDF files to merge.', 400);
  }

  const filePaths = files.map((f) => f.path);
  let outputPath;
  try {
    outputPath = await mergePdfs(filePaths);
  } finally {
    // Uploaded originals are no longer needed once merged (or on failure).
    await safeDeleteMany(filePaths);
  }

  res.render('pages/result', {
    title: 'Merge PDF',
    message: 'Your PDFs have been merged successfully.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleMerge };
