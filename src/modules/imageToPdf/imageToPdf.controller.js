const path = require('path');
const AppError = require('../../utils/AppError');
const { imagesToPdf } = require('./imageToPdf.service');
const { safeDeleteMany } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/image-to-pdf', { title: 'Image to PDF', pageScript: 'image-preview' });
}

async function handleConvert(req, res) {
  const files = req.files;
  if (!files || files.length === 0) {
    throw new AppError('Please upload at least 1 image.', 400);
  }

  const imagePaths = files.map((f) => f.path);
  let outputPath;
  try {
    outputPath = await imagesToPdf(imagePaths);
  } finally {
    await safeDeleteMany(imagePaths);
  }

  res.render('pages/result', {
    title: 'Image to PDF',
    message: 'Your images have been converted to PDF successfully.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleConvert };
