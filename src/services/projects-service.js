const projectsQueries = require('../db/queries/projects-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const { isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');

function listProjects() {
  return projectsQueries.findAll();
}

function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) throw createHttpError(400, 'name is required');
  return projectsQueries.create({
    name,
    description: description || null,
    ownerId: owner_id || null
  });
}

function getProjectStats(projectId) {
  const rows = tasksQueries.countByStatusForProject(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

function getProject(id) {
  const project = projectsQueries.findById(id);
  if (!project) throw createHttpError(404, 'Project not found');
  return { ...project, stats: getProjectStats(id) };
}

function updateProject(id, data) {
  const existing = projectsQueries.findById(id);
  if (!existing) throw createHttpError(404, 'Project not found');
  return projectsQueries.update(id, {
    name: data.name !== undefined ? data.name : existing.name,
    description: data.description !== undefined ? data.description : existing.description,
    ownerId: data.owner_id !== undefined ? data.owner_id : existing.owner_id
  });
}

function deleteProject(id) {
  if (projectsQueries.remove(id) === 0) throw createHttpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, getProjectStats };
