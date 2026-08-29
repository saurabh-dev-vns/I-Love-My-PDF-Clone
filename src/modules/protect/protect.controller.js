const path = require('path');
const AppError = require('../../utils/AppError');
const { protectPdf } = require('./protect.service');
const { safeDelete } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/protect', { title: 'Protect PDF', pageScript: 'simple-preview' });
}

async function handleProtect(req, res) {
  const file = req.file;
  if (!file) throw new AppError('Please upload a PDF file.', 400);

  const password = (req.body.password || '').trim();
  if (!password) throw new AppError('Please provide a password.', 400);

  let outputPath;
  try {
    outputPath = await protectPdf(file.path, password);
  } finally {
    await safeDelete(file.path);
  }

  res.render('pages/result', {
    title: 'Protect PDF',
    message: 'Your PDF is now password protected.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleProtect };
