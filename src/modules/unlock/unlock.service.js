const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const { buildOutputPath } = require('../../utils/fileHelper');
const AppError = require('../../utils/AppError');

/**
 * Removes a known password from a PDF using qpdf.
 * @returns {Promise<string>} absolute path of the unlocked PDF.
 */
async function unlockPdf(filePath, password) {
  const outputPath = buildOutputPath('unlocked', 'pdf');
  try {
    await execFileAsync('qpdf', [
      `--password=${password}`,
      '--decrypt',
      '--',
      filePath,
      outputPath,
    ]);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new AppError(
        'qpdf is not installed on this system. Install it (e.g. `sudo apt install qpdf`) to enable PDF unlocking.',
        501
      );
    }
    throw new AppError('Failed to unlock PDF — check the password and try again.', 400);
  }
  return outputPath;
}

module.exports = { unlockPdf };
