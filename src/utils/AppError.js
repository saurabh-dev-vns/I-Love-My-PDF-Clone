// Throw `new AppError('message', 400)` anywhere in services/controllers.
// The global error middleware knows how to render these nicely.

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
