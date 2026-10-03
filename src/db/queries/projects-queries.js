const { db } = require('../connection');

/**
 * @description Fetches all projects, newest first.
 * @returns {Object[]} Project rows.
 */
function findAll() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

/**
 * @description Fetches a single project by ID.
 * @param {number} id - ID of the project.
 * @returns {Object|undefined} The project row, or undefined if not found.
 */
function findById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Inserts a new project and returns the stored row.
 * @param {Object} project - Project fields.
 * @param {string} project.name - Project name.
 * @param {?string} project.description - Project description.
 * @param {?number} project.ownerId - ID of the owning user.
 * @returns {Object} The newly created project row.
 */
function create({ name, description, ownerId }) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
  return findById(result.lastInsertRowid);
}

/**
 * @description Overwrites a project's name, description and owner and returns the updated row.
 * @param {number} id - ID of the project to update.
 * @param {Object} fields - New field values.
 * @param {string} fields.name - Project name.
 * @param {?string} fields.description - Project description.
 * @param {?number} fields.ownerId - ID of the owning user.
 * @returns {Object|undefined} The updated project row.
 */
function update(id, { name, description, ownerId }) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
  return findById(id);
}

/**
 * @description Deletes a project by ID.
 * @param {number} id - ID of the project to delete.
 * @returns {number} Number of rows deleted (0 if the project did not exist).
 */
function remove(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes;
}

module.exports = { findAll, findById, create, update, remove };
