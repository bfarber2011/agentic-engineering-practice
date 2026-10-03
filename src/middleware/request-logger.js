/**
 * @description Express middleware that logs the timestamp, method and URL of each incoming request.
 * @param {import("express").Request} req - The incoming request.
 * @param {import("express").Response} res - The response (unused).
 * @param {import("express").NextFunction} next - Called to pass control to the next middleware.
 * @returns {void} Nothing.
 */
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

module.exports = { requestLogger };
