const taskTagsQueries = require('../db/queries/task-tags-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const tagsQueries = require('../db/queries/tags-queries');
const { createHttpError } = require('../utils/http-error');
const { isUniqueViolation } = require('../utils/db-errors');

/**
 * @description Applies an existing tag to an existing task.
 * @param {number} taskId - ID of the task.
 * @param {Object} data - Request body.
 * @param {number|string} data.tag_id - ID of the tag to apply.
 * @returns {{task_id: number, tag_id: number}} The new association. Throws 404 if the task or tag is missing, 400 if tag_id is absent, or 409 if already applied.
 */
function addTagToTask(taskId, { tag_id }) {
  if (!tasksQueries.findById(taskId)) throw createHttpError(404, 'Task not found');
  if (!tag_id) throw createHttpError(400, 'tag_id is required');
  if (!tagsQueries.findById(parseInt(tag_id))) throw createHttpError(404, 'Tag not found');

  try {
    taskTagsQueries.add(taskId, parseInt(tag_id));
  } catch (err) {
    if (isUniqueViolation(err)) throw createHttpError(409, 'tag already applied to this task');
    throw err;
  }
  return { task_id: taskId, tag_id: parseInt(tag_id) };
}

/**
 * @description Removes a tag from a task.
 * @param {number} taskId - ID of the task.
 * @param {number} tagId - ID of the tag to remove.
 * @returns {{deleted: boolean}} `{ deleted: true }`. Throws 404 if the tag is not applied to the task.
 */
function removeTagFromTask(taskId, tagId) {
  if (taskTagsQueries.remove(taskId, tagId) === 0) {
    throw createHttpError(404, 'Tag not applied to this task');
  }
  return { deleted: true };
}

module.exports = { addTagToTask, removeTagFromTask };
