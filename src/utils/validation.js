/**
 * @description Checks whether a value looks like an email address (something@domain.tld, no whitespace).
 * @param {string} email - The value to test.
 * @returns {boolean} True if the value matches the email pattern, otherwise false.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @description Checks whether a value is a string containing at least one non-whitespace character.
 * @param {*} val - The value to test.
 * @returns {boolean} True if the value is a non-blank string, otherwise false.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

module.exports = { validateEmail, isNonEmptyString };
