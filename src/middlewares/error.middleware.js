const logger = require('../utils/logger');

/** 404 handler — must be registered after all routes. */
function notFoundHandler(req, res) {
  res.status(404).render('pages/error', {
    title: 'Not Found',
    statusCode: 404,
    message: `Page not found: ${req.originalUrl}`,
  });
}

/** Global error handler — must be registered LAST, after notFoundHandler. */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Something went wrong while processing your file.';

  if (!err.isOperational) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(err.message);
  }

  res.status(statusCode).render('pages/error', {
    title: 'Error',
    statusCode,
    message,
  });
}

module.exports = { notFoundHandler, errorHandler };
