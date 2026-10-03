const { db } = require('../connection');

/**
 * @description Fetches all tags applied to a task.
 * @param {number} taskId - ID of the task.
 * @returns {Object[]} Tag rows.
 */
function findTagsByTaskId(taskId) {
  return db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(taskId);
}

/**
 * @description Applies a tag to a task.
 * @param {number} taskId - ID of the task.
 * @param {number} tagId - ID of the tag to apply.
 * @returns {void} Nothing; throws on a duplicate task/tag pair.
 */
function add(taskId, tagId) {
  db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/**
 * @description Removes a tag from a task.
 * @param {number} taskId - ID of the task.
 * @param {number} tagId - ID of the tag to remove.
 * @returns {number} Number of rows deleted (0 if the tag was not applied).
 */
function remove(taskId, tagId) {
  return db.prepare(
    'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?'
  ).run(taskId, tagId).changes;
}

module.exports = { findTagsByTaskId, add, remove };
