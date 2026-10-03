const { createHttpError } = require('../utils/http-error');

// TODO: replace with real JWT validation

/**
 * @description Express middleware that allows a request only if its `x-api-key` header matches the configured API key.
 * @param {import("express").Request} req - The request; its `x-api-key` header is checked.
 * @param {import("express").Response} res - The response (unused).
 * @param {import("express").NextFunction} next - Called with no argument on success, or with a 401 error on failure.
 * @returns {void} Nothing.
 */
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  next(createHttpError(401, 'Unauthorized'));
}

module.exports = { authenticate };
