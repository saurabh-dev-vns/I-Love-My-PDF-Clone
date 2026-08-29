// Central multer factory. Every module calls createUploader() instead of
// configuring multer itself — keeps upload rules (size limit, naming,
// destination) consistent across the whole app.

const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const env = require('./env');

function createUploader({ allowedMime = null } = {}) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, env.UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedMime && !allowedMime.includes(file.mimetype)) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  });
}

module.exports = createUploader;
