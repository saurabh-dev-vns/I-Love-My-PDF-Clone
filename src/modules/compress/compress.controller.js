const path = require('path');
const AppError = require('../../utils/AppError');
const { compressPdf } = require('./compress.service');
const { safeDelete } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/compress', { title: 'Compress PDF', pageScript: 'compress-preview' });
}

async function handleCompress(req, res) {
  const file = req.file;
  if (!file) throw new AppError('Please upload a PDF file.', 400);

  let result;
  try {
    result = await compressPdf(file.path);
  } finally {
    await safeDelete(file.path);
  }

  const savedPct = (
    ((result.originalSize - result.newSize) / result.originalSize) *
    100
  ).toFixed(1);

  res.render('pages/result', {
    title: 'Compress PDF',
    message: `Compressed successfully. Size reduced by ${savedPct}% (${(result.originalSize / 1024).toFixed(1)} KB → ${(result.newSize / 1024).toFixed(1)} KB).`,
    downloadUrl: `/download/${path.basename(result.outputPath)}`,
  });
}

module.exports = { showForm, handleCompress };
