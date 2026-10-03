/**
 * @description Creates an Error carrying an HTTP status code, for the central error handler to turn into a response.
 * @param {number} status - HTTP status code (e.g. 400, 404, 409).
 * @param {string} message - Human-readable error message.
 * @returns {Error} An Error whose `message` is the given message and whose `status` property is the given status.
 */
function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { createHttpError };
