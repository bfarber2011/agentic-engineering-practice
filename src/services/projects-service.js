const projectsQueries = require('../db/queries/projects-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');

/**
 * @description Lists all projects.
 * @returns {Object[]} Project rows, newest first.
 */
function listProjects() {
  return projectsQueries.findAll();
}

/**
 * @description Validates and creates a project.
 * @param {Object} data - Project data from the request body.
 * @param {string} data.name - Project name (required).
 * @param {string} [data.description] - Project description.
 * @param {number} [data.owner_id] - ID of the owning user.
 * @returns {Object} The created project row. Throws 400 if the name is missing.
 */
function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) throw createHttpError(400, 'name is required');
  return projectsQueries.create({
    name,
    description: description || null,
    ownerId: owner_id || null
  });
}

/**
 * @description Computes task counts for a project, in total and per status.
 * @param {number} projectId - ID of the project.
 * @returns {{total: number, active: number, completed: number, archived: number}} Task counts.
 */
function getProjectStats(projectId) {
  const rows = tasksQueries.countByStatusForProject(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

/**
 * @description Fetches a project together with its task statistics.
 * @param {number} id - ID of the project.
 * @returns {Object} The project row with a `stats` field. Throws 404 if not found.
 */
function getProject(id) {
  const project = projectsQueries.findById(id);
  if (!project) throw createHttpError(404, 'Project not found');
  return { ...project, stats: getProjectStats(id) };
}

/**
 * @description Applies a partial update to a project, keeping existing values for omitted fields.
 * @param {number} id - ID of the project.
 * @param {Object} data - Fields to change (`name`, `description`, `owner_id`).
 * @returns {Object} The updated project row. Throws 404 if not found.
 */
function updateProject(id, data) {
  const existing = projectsQueries.findById(id);
  if (!existing) throw createHttpError(404, 'Project not found');
  return projectsQueries.update(id, {
    name: data.name !== undefined ? data.name : existing.name,
    description: data.description !== undefined ? data.description : existing.description,
    ownerId: data.owner_id !== undefined ? data.owner_id : existing.owner_id
  });
}

/**
 * @description Deletes a project.
 * @param {number} id - ID of the project.
 * @returns {{deleted: boolean}} `{ deleted: true }`. Throws 404 if not found.
 */
function deleteProject(id) {
  if (projectsQueries.remove(id) === 0) throw createHttpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, getProjectStats };
