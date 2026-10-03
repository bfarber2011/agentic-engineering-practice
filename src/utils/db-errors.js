/**
 * @description Checks whether a database error is a SQLite UNIQUE constraint violation.
 * @param {Error} err - The error thrown by the database driver.
 * @returns {boolean} True if the error message mentions a UNIQUE constraint, otherwise false.
 */
function isUniqueViolation(err) {
  return Boolean(err.message && err.message.includes('UNIQUE'));
}

module.exports = { isUniqueViolation };
