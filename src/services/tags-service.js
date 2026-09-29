const tagsQueries = require('../db/queries/tags-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');
const { isUniqueViolation } = require('../utils/db-errors');

function listTags() {
  return tagsQueries.findAll();
}

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
