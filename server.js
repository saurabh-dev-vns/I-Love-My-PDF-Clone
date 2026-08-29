const createApp = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const { ensureStorageDirs, cleanupExpiredFiles } = require('./src/utils/fileHelper');

async function start() {
  await ensureStorageDirs();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`PDF Toolkit running at http://localhost:${env.PORT}`);
  });

  // Sweep storage/uploads|outputs|temp every 15 minutes for expired files.
  setInterval(() => {
    cleanupExpiredFiles().catch((err) => logger.error('Cleanup failed:', err.message));
  }, 15 * 60 * 1000);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
