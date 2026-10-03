/**
 * @description Central Express error handler that responds with `{ error: message }` and the error's status (default 500).
 * @param {Error & {status?: number}} err - The error passed to `next`.
 * @param {import("express").Request} req - The request (unused).
 * @param {import("express").Response} res - The response used to send the error.
 * @param {import("express").NextFunction} next - Next callback (unused; required for Express to treat this as an error handler).
 * @returns {void} Nothing.
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err.stack);
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
