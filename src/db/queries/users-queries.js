const { db } = require('../connection');

/**
 * @description Fetches all users, newest first.
 * @returns {Object[]} User rows.
 */
function findAll() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

/**
 * @description Fetches a single user by ID.
 * @param {number} id - ID of the user.
 * @returns {Object|undefined} The user row, or undefined if not found.
 */
function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Inserts a new user and returns the stored row.
 * @param {Object} user - User fields.
 * @param {string} user.name - Display name.
 * @param {string} user.email - Unique email address.
 * @returns {Object} The newly created user row.
 */
function create({ name, email }) {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
  return findById(result.lastInsertRowid);
}

/**
 * @description Overwrites a user's name and email and returns the updated row.
 * @param {number} id - ID of the user to update.
 * @param {Object} fields - New field values.
 * @param {string} fields.name - Display name.
 * @param {string} fields.email - Unique email address.
 * @returns {Object|undefined} The updated user row.
 */
function update(id, { name, email }) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return findById(id);
}

/**
 * @description Deletes a user by ID.
 * @param {number} id - ID of the user to delete.
 * @returns {number} Number of rows deleted (0 if the user did not exist).
 */
function remove(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes;
}

module.exports = { findAll, findById, create, update, remove };
