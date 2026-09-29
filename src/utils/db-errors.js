function isUniqueViolation(err) {
  return Boolean(err.message && err.message.includes('UNIQUE'));
}

module.exports = { isUniqueViolation };
