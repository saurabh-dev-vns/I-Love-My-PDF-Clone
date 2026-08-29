const path = require('path');
const AppError = require('../../utils/AppError');
const { extractPages, splitEveryPage } = require('./split.service');
const { safeDelete } = require('../../utils/fileHelper');

function showForm(req, res) {
  res.render('pages/split', { title: 'Split PDF', pageScript: 'split-preview' });
}

async function handleSplit(req, res) {
  const file = req.file;
  if (!file) throw new AppError('Please upload a PDF file.', 400);

  const { mode, range } = req.body; // mode = 'range' | 'all'
  let outputPath;

  try {
    if (mode === 'range') {
      if (!range) throw new AppError('Please provide a page range (e.g. 1-3,5).', 400);
      outputPath = await extractPages(file.path, range);
    } else {
      outputPath = await splitEveryPage(file.path);
    }
  } finally {
    await safeDelete(file.path);
  }

  res.render('pages/result', {
    title: 'Split PDF',
    message: 'Your PDF has been split successfully.',
    downloadUrl: `/download/${path.basename(outputPath)}`,
  });
}

module.exports = { showForm, handleSplit };
