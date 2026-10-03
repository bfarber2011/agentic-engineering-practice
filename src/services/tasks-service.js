const tasksQueries = require('../db/queries/tasks-queries');
const projectsQueries = require('../db/queries/projects-queries');
const usersQueries = require('../db/queries/users-queries');
const taskTagsQueries = require('../db/queries/task-tags-queries');
const commentsQueries = require('../db/queries/comments-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');
const { VALID_TASK_STATUSES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../utils/constants');

/**
 * @description Throws a 400 error if the status is not an allowed task status.
 * @param {string} status - The status value to check.
 * @returns {void} Nothing; throws if the status is invalid.
 */
function assertValidStatus(status) {
  if (!VALID_TASK_STATUSES.includes(status)) {
    throw createHttpError(400, `status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
  }
}

/**
 * @description Lists tasks with optional status, project and assignee filters and pagination.
 * @param {Object} query - Query-string parameters.
 * @param {string} [query.status] - Filter by status.
 * @param {number|string} [query.project_id] - Filter by project ID.
 * @param {number|string} [query.assignee_id] - Filter by assignee ID.
 * @param {number|string} [query.page] - 1-based page number.
 * @param {number|string} [query.page_size] - Page size, capped at the maximum.
 * @returns {Object[]} Task rows, newest first. Throws 400 if the status is invalid.
 */
function listTasks({ status, project_id, assignee_id, page, page_size }) {
  if (status) assertValidStatus(status);

  const limit = Math.min(MAX_PAGE_SIZE, parseInt(page_size) || DEFAULT_PAGE_SIZE);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  return tasksQueries.findAll({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

/**
 * @description Fetches a task together with its tags and comments.
 * @param {number} id - ID of the task.
 * @returns {Object} The task row with `tags` and `comments` fields. Throws 404 if not found.
 */
function getTask(id) {
  const task = tasksQueries.findById(id);
  if (!task) throw createHttpError(404, 'Task not found');
  task.tags = taskTagsQueries.findTagsByTaskId(id);
  task.comments = commentsQueries.findByTaskId(id);
  return task;
}

/**
 * @description Validates and creates a task.
 * @param {Object} data - Task data from the request body.
 * @param {string} data.title - Task title (required).
 * @param {string} [data.description] - Task description.
 * @param {number|string} [data.project_id] - ID of an existing project.
 * @param {number|string} [data.assignee_id] - ID of an existing user.
 * @param {string} [data.due_date] - Due date.
 * @returns {Object} The created task row. Throws 400 if the title is missing or the project or assignee does not exist.
 */
function createTask({ title, description, project_id, assignee_id, due_date }) {
  if (!title || !isNonEmptyString(title)) throw createHttpError(400, 'title is required');
  if (project_id && !projectsQueries.findById(parseInt(project_id))) {
    throw createHttpError(400, 'project not found');
  }
  if (assignee_id && !usersQueries.findById(parseInt(assignee_id))) {
    throw createHttpError(400, 'assignee not found');
  }
  return tasksQueries.create({
    title,
    description: description || null,
    projectId: project_id ? parseInt(project_id) : null,
    assigneeId: assignee_id ? parseInt(assignee_id) : null,
    dueDate: due_date || null
  });
}

/**
 * @description Applies a partial update to a task and sets or clears `completed_at` as the status changes.
 * @param {number} id - ID of the task.
 * @param {Object} data - Fields to change.
 * @param {string} [data.title] - Task title.
 * @param {string} [data.description] - Task description.
 * @param {string} [data.status] - New status.
 * @param {number} [data.project_id] - ID of the parent project.
 * @param {number} [data.assignee_id] - ID of the assigned user.
 * @param {string} [data.due_date] - Due date.
 * @returns {Object} The updated task row. Throws 404 if not found, or 400 if the status is invalid.
 */
function updateTask(id, { title, description, status, project_id, assignee_id, due_date }) {
  const existing = tasksQueries.findById(id);
  if (!existing) throw createHttpError(404, 'Task not found');

  if (status) assertValidStatus(status);

  const updatedStatus = status !== undefined ? status : existing.status;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  return tasksQueries.update(id, {
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    status: updatedStatus,
    projectId: project_id !== undefined ? project_id : existing.project_id,
    assigneeId: assignee_id !== undefined ? assignee_id : existing.assignee_id,
    dueDate: due_date !== undefined ? due_date : existing.due_date,
    completedAt
  });
}

/**
 * @description Deletes a task.
 * @param {number} id - ID of the task.
 * @returns {{deleted: boolean}} `{ deleted: true }`. Throws 404 if not found.
 */
function deleteTask(id) {
  if (tasksQueries.remove(id) === 0) throw createHttpError(404, 'Task not found');
  return { deleted: true };
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
