// Loads and exposes all environment variables from a single place.
// Any module needing config should import from here instead of using
// process.env directly — makes future changes (e.g. adding cloud storage) easy.

require('dotenv').config();
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  UPLOAD_DIR: path.join(ROOT_DIR, process.env.UPLOAD_DIR || 'storage/uploads'),
  OUTPUT_DIR: path.join(ROOT_DIR, process.env.OUTPUT_DIR || 'storage/outputs'),
  TEMP_DIR: path.join(ROOT_DIR, process.env.TEMP_DIR || 'storage/temp'),

  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB || 50),
  FILE_TTL_MINUTES: Number(process.env.FILE_TTL_MINUTES || 60),
};
