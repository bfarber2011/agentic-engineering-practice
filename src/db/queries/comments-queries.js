const { db } = require('../connection');

/**
 * @description Fetches all comments on a task, oldest first, including each author's name.
 * @param {number} taskId - ID of the task whose comments to fetch.
 * @returns {Object[]} Comment rows with an added `user_name` field.
 */
function findByTaskId(taskId) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(taskId);
}

/**
 * @description Fetches a single comment by ID, including its author's name.
 * @param {number} id - ID of the comment.
 * @returns {Object|undefined} The comment row with `user_name`, or undefined if not found.
 */
function findById(id) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?'
  ).get(id);
}

/**
 * @description Inserts a new comment and returns the stored row.
 * @param {Object} comment - Comment fields.
 * @param {number} comment.taskId - ID of the task being commented on.
 * @param {number} comment.userId - ID of the comment author.
 * @param {string} comment.body - Comment text.
 * @returns {Object} The newly created comment row with `user_name`.
 */
function create({ taskId, userId, body }) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return findById(result.lastInsertRowid);
}

module.exports = { findByTaskId, findById, create };
