const commentsQueries = require('../db/queries/comments-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const usersQueries = require('../db/queries/users-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');

function assertTaskExists(taskId) {
  if (!tasksQueries.findById(taskId)) throw createHttpError(404, 'Task not found');
}

function listComments(taskId) {
  assertTaskExists(taskId);
  return commentsQueries.findByTaskId(taskId);
}

function addComment(taskId, { user_id, body }) {
  assertTaskExists(taskId);
  if (!body || !isNonEmptyString(body)) throw createHttpError(400, 'body is required');
  if (!user_id) throw createHttpError(400, 'user_id is required');
  if (!usersQueries.findById(parseInt(user_id))) throw createHttpError(400, 'user not found');

  return commentsQueries.create({ taskId, userId: parseInt(user_id), body });
}

module.exports = { listComments, addComment };
