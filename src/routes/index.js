const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const router = express.Router();

const { TOOLS } = require('../config/constants');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// --- Homepage: lists every tool, generated from TOOLS registry ---
router.get('/', (req, res) => {
  res.render('pages/home', { title: 'PDF Toolkit', tools: TOOLS });
});

// --- Module routes: each module owns its own routes file ---
// To add a new feature: create src/modules/<name>/, then add one line here.
router.use('/merge', require('../modules/merge/merge.routes'));
router.use('/split', require('../modules/split/split.routes'));
router.use('/rotate', require('../modules/rotate/rotate.routes'));
router.use('/watermark', require('../modules/watermark/watermark.routes'));
router.use('/compress', require('../modules/compress/compress.routes'));
router.use('/image-to-pdf', require('../modules/imageToPdf/imageToPdf.routes'));
router.use('/protect', require('../modules/protect/protect.routes'));
router.use('/unlock', require('../modules/unlock/unlock.routes'));
router.use('/pdf-to-word', require('../modules/pdfToWord/pdfToWord.routes'));

// --- Shared download endpoint: serves any file from storage/outputs ---
router.get('/download/:filename', asyncHandler(async (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filePath = path.join(env.OUTPUT_DIR, filename);

  if (!(await fs.pathExists(filePath))) {
    throw new AppError('This file has expired or does not exist.', 404);
  }
  res.download(filePath);
}));

module.exports = router;
