// Wrap any async route/controller function with this to automatically
// forward rejected promises to Express's error handler.
// Usage: router.post('/', asyncHandler(controller.merge))

module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
