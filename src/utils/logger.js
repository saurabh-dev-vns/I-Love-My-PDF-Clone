// Minimal leveled logger. Swap the internals later (e.g. for winston/pino)
// without touching any calling code, since everything imports from here.

const levels = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' };
const reset = '\x1b[0m';

function log(level, ...args) {
  const color = levels[level] || '';
  const tag = `[${level.toUpperCase()}]`;
  console.log(`${color}${tag}${reset}`, new Date().toISOString(), ...args);
}

module.exports = {
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
};
