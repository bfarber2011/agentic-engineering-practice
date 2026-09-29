const tasksQueries = require('../db/queries/tasks-queries');
const projectsQueries = require('../db/queries/projects-queries');
const usersQueries = require('../db/queries/users-queries');
const taskTagsQueries = require('../db/queries/task-tags-queries');
const commentsQueries = require('../db/queries/comments-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');
const { VALID_TASK_STATUSES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../utils/constants');

function assertValidStatus(status) {
  if (!VALID_TASK_STATUSES.includes(status)) {
    throw createHttpError(400, `status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
  }
}

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

function getTask(id) {
  const task = tasksQueries.findById(id);
  if (!task) throw createHttpError(404, 'Task not found');
  task.tags = taskTagsQueries.findTagsByTaskId(id);
  task.comments = commentsQueries.findByTaskId(id);
  return task;
}

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

function deleteTask(id) {
  if (tasksQueries.remove(id) === 0) throw createHttpError(404, 'Task not found');
  return { deleted: true };
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
