const { db } = require('../connection');

/**
 * @description Fetches all tags ordered alphabetically by name.
 * @returns {Object[]} Tag rows.
 */
function findAll() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

/**
 * @description Fetches a single tag by ID.
 * @param {number} id - ID of the tag.
 * @returns {Object|undefined} The tag row, or undefined if not found.
 */
function findById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

/**
 * @description Inserts a new tag and returns the stored row.
 * @param {string} name - Unique tag name.
 * @returns {Object} The newly created tag row.
 */
function create(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findById(result.lastInsertRowid);
}

module.exports = { findAll, findById, create };
