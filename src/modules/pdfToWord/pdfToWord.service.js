// Requires LibreOffice installed on the host (provides the `soffice` binary).
// True PDF->DOCX conversion with layout fidelity is a hard problem; LibreOffice's
// headless converter is the most reliable free/local option.

const { execFile } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const execFileAsync = util.promisify(execFile);
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

/**
 * Converts a PDF to DOCX using `soffice --headless --convert-to docx`.
 * @returns {Promise<string>} absolute path of the generated .docx file.
 */
async function pdfToWord(filePath) {
  const outDir = env.TEMP_DIR;
  try {
    await execFileAsync('soffice', [
      '--headless',
      '--convert-to', 'docx',
      '--outdir', outDir,
      filePath,
    ]);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new AppError(
        'LibreOffice is not installed on this system. Install it (e.g. `sudo apt install libreoffice`) to enable PDF-to-Word conversion.',
        501
      );
    }
    throw new AppError('Failed to convert PDF to Word: ' + err.message, 500);
  }

  const generatedName = path.basename(filePath, path.extname(filePath)) + '.docx';
  const generatedPath = path.join(outDir, generatedName);

  const finalPath = path.join(env.OUTPUT_DIR, generatedName);
  await fs.move(generatedPath, finalPath, { overwrite: true });
  return finalPath;
}

module.exports = { pdfToWord };
