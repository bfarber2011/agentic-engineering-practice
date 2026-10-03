const tagsQueries = require('../db/queries/tags-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');
const { isUniqueViolation } = require('../utils/db-errors');

/**
 * @description Lists all tags.
 * @returns {Object[]} Tag rows ordered by name.
 */
function listTags() {
  return tagsQueries.findAll();
}

/**
 * @description Validates and creates a tag, normalizing the name to trimmed lowercase.
 * @param {Object} data - Tag data from the request body.
 * @param {string} data.name - Tag name (required).
 * @returns {Object} The created tag row. Throws 400 if the name is missing, or 409 if the tag already exists.
 */
function createTag({ name }) {
  if (!name || !isNonEmptyString(name)) throw createHttpError(400, 'name is required');
  try {
    return tagsQueries.create(name.toLowerCase().trim());
  } catch (err) {
    if (isUniqueViolation(err)) throw createHttpError(409, 'tag already exists');
    throw err;
  }
}

module.exports = { listTags, createTag };
