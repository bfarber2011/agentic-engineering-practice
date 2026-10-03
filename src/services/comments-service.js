const commentsQueries = require('../db/queries/comments-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const usersQueries = require('../db/queries/users-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');

/**
 * @description Throws a 404 error if the task does not exist.
 * @param {number} taskId - ID of the task to check.
 * @returns {void} Nothing; throws if the task is missing.
 */
function assertTaskExists(taskId) {
  if (!tasksQueries.findById(taskId)) throw createHttpError(404, 'Task not found');
}

/**
 * @description Lists the comments on a task.
 * @param {number} taskId - ID of the task.
 * @returns {Object[]} Comment rows, oldest first. Throws a 404 error if the task does not exist.
 */
function listComments(taskId) {
  assertTaskExists(taskId);
  return commentsQueries.findByTaskId(taskId);
}

/**
 * @description Validates and adds a comment to a task.
 * @param {number} taskId - ID of the task.
 * @param {Object} data - Comment data from the request body.
 * @param {number|string} data.user_id - ID of the comment author.
 * @param {string} data.body - Comment text.
 * @returns {Object} The created comment row. Throws 404 if the task is missing, or 400 if body or user is invalid.
 */
function addComment(taskId, { user_id, body }) {
  assertTaskExists(taskId);
  if (!body || !isNonEmptyString(body)) throw createHttpError(400, 'body is required');
  if (!user_id) throw createHttpError(400, 'user_id is required');
  if (!usersQueries.findById(parseInt(user_id))) throw createHttpError(400, 'user not found');

  return commentsQueries.create({ taskId, userId: parseInt(user_id), body });
}

module.exports = { listComments, addComment };
