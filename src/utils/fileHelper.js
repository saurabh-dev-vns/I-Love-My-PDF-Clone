const fs = require('fs-extra');
const path = require('path');
const { v4: uuid } = require('uuid');
const env = require('../config/env');

/** Ensures the three storage dirs exist. Called once on server boot. */
async function ensureStorageDirs() {
  await fs.ensureDir(env.UPLOAD_DIR);
  await fs.ensureDir(env.OUTPUT_DIR);
  await fs.ensureDir(env.TEMP_DIR);
}

/** Builds a unique output file path inside storage/outputs. */
function buildOutputPath(baseName, ext) {
  const safeBase = baseName.replace(/[^a-z0-9-_]/gi, '_').slice(0, 40);
  return path.join(env.OUTPUT_DIR, `${safeBase}-${uuid()}.${ext}`);
}

/** Deletes a file if it exists; swallows errors (best-effort cleanup). */
async function safeDelete(filePath) {
  try {
    if (filePath && (await fs.pathExists(filePath))) {
      await fs.remove(filePath);
    }
  } catch (err) {
    console.error(`[fileHelper] failed to delete ${filePath}:`, err.message);
  }
}

/** Deletes multiple files (e.g. all req.files after processing). */
async function safeDeleteMany(filePaths = []) {
  await Promise.all(filePaths.map(safeDelete));
}

/**
 * Sweeps storage/uploads, storage/outputs and storage/temp, removing files
 * older than FILE_TTL_MINUTES. Call on an interval from server.js.
 */
async function cleanupExpiredFiles() {
  if (env.FILE_TTL_MINUTES <= 0) return;
  const ttlMs = env.FILE_TTL_MINUTES * 60 * 1000;
  const dirs = [env.UPLOAD_DIR, env.OUTPUT_DIR, env.TEMP_DIR];

  for (const dir of dirs) {
    const files = await fs.readdir(dir).catch(() => []);
    for (const file of files) {
      if (file === '.gitkeep') continue;
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath).catch(() => null);
      if (stat && Date.now() - stat.mtimeMs > ttlMs) {
        await safeDelete(fullPath);
      }
    }
  }
}

module.exports = {
  ensureStorageDirs,
  buildOutputPath,
  safeDelete,
  safeDeleteMany,
  cleanupExpiredFiles,
};
