const { createHttpError } = require('../utils/http-error');

// TODO: replace with real JWT validation

function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  next(createHttpError(401, 'Unauthorized'));
}

module.exports = { authenticate };
