const path = require('path');
const AppError = require('../../utils/AppError');
const { pdfToWord } = require('./pdfToWord.service');
const { safeDelete } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/pdf-to-word', { title: 'PDF to Word', pageScript: 'simple-preview' });
}

async function handleConvert(req, res) {
  const file = req.file;
  if (!file) throw new AppError('Please upload a PDF file.', 400);

  let outputPath;
  try {
    outputPath = await pdfToWord(file.path);
  } finally {
    await safeDelete(file.path);
  }

  res.render('pages/result', {
    title: 'PDF to Word',
    message: 'Your PDF has been converted to a Word document.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleConvert };
