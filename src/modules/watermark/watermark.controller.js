const path = require('path');
const AppError = require('../../utils/AppError');
const { addWatermark } = require('./watermark.service');
const { safeDelete } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/watermark', { title: 'Add Watermark', pageScript: 'watermark-preview' });
}

async function handleWatermark(req, res) {
  const file = req.file;
  if (!file) throw new AppError('Please upload a PDF file.', 400);

  const text = (req.body.text || '').trim();
  if (!text) throw new AppError('Please provide watermark text.', 400);

  let outputPath;
  try {
    outputPath = await addWatermark(file.path, text);
  } finally {
    await safeDelete(file.path);
  }

  res.render('pages/result', {
    title: 'Add Watermark',
    message: 'Watermark added successfully.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleWatermark };
