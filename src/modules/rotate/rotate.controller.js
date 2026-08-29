const path = require('path');
const AppError = require('../../utils/AppError');
const { rotatePdf } = require('./rotate.service');
const { safeDelete } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/rotate', { title: 'Rotate PDF', pageScript: 'rotate-preview' });
}

async function handleRotate(req, res) {
  const file = req.file;
  if (!file) throw new AppError('Please upload a PDF file.', 400);

  const angle = Number(req.body.angle);
  if (![90, 180, 270].includes(angle)) {
    throw new AppError('Angle must be 90, 180 or 270.', 400);
  }

  let outputPath;
  try {
    outputPath = await rotatePdf(file.path, angle);
  } finally {
    await safeDelete(file.path);
  }

  res.render('pages/result', {
    title: 'Rotate PDF',
    message: 'Your PDF has been rotated successfully.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleRotate };
