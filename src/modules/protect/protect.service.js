// Requires `qpdf` installed on the host system (apt install qpdf / brew install qpdf).
// We shell out to it because pdf-lib does not support PDF encryption.

const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const { buildOutputPath } = require('../../utils/fileHelper');
const AppError = require('../../utils/AppError');

/**
 * Adds a user password to a PDF using qpdf.
 * @returns {Promise<string>} absolute path of the protected PDF.
 */
async function protectPdf(filePath, password) {
  const outputPath = buildOutputPath('protected', 'pdf');
  try {
    await execFileAsync('qpdf', [
      '--encrypt', password, password, '256',
      '--',
      filePath,
      outputPath,
    ]);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new AppError(
        'qpdf is not installed on this system. Install it (e.g. `sudo apt install qpdf`) to enable PDF protection.',
        501
      );
    }
    throw new AppError('Failed to protect PDF: ' + err.message, 500);
  }
  return outputPath;
}

module.exports = { protectPdf };
