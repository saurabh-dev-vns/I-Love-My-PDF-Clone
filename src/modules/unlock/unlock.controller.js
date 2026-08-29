const path = require('path');
const AppError = require('../../utils/AppError');
const { unlockPdf } = require('./unlock.service');
const { safeDelete } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/unlock', { title: 'Unlock PDF', pageScript: 'simple-preview' });
}

async function handleUnlock(req, res) {
  const file = req.file;
  if (!file) throw new AppError('Please upload a PDF file.', 400);

  const password = (req.body.password || '').trim();
  if (!password) throw new AppError('Please provide the current password.', 400);

  let outputPath;
  try {
    outputPath = await unlockPdf(file.path, password);
  } finally {
    await safeDelete(file.path);
  }

  res.render('pages/result', {
    title: 'Unlock PDF',
    message: 'Your PDF has been unlocked.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleUnlock };
