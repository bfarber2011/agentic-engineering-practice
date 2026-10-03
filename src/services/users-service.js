const usersQueries = require('../db/queries/users-queries');
const { sendEmail } = require('./email-service');
const { validateEmail, isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');
const { isUniqueViolation } = require('../utils/db-errors');

/**
 * @description Lists all users.
 * @returns {Object[]} User rows, newest first.
 */
function listUsers() {
  return usersQueries.findAll();
}

/**
 * @description Fetches a single user.
 * @param {number} id - ID of the user.
 * @returns {Object} The user row. Throws 404 if not found.
 */
function getUser(id) {
  const user = usersQueries.findById(id);
  if (!user) throw createHttpError(404, 'User not found');
  return user;
}

/**
 * @description Validates and creates a user, then sends a welcome email.
 * @param {Object} data - User data from the request body.
 * @param {string} data.name - Display name (required).
 * @param {string} data.email - Unique, valid email address (required).
 * @returns {Promise<Object>} Resolves with the created user row. Throws 400 for invalid input or 409 if the email already exists.
 */
async function createUser({ name, email }) {
  if (!name || !isNonEmptyString(name)) throw createHttpError(400, 'name is required');
  if (!email || !isNonEmptyString(email)) throw createHttpError(400, 'email is required');
  if (!validateEmail(email)) throw createHttpError(400, 'Invalid email address');

  let user;
  try {
    user = usersQueries.create({ name, email });
  } catch (err) {
    if (isUniqueViolation(err)) throw createHttpError(409, 'email already exists');
    throw err;
  }

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });

  return user;
}

/**
 * @description Applies a partial update to a user, keeping existing values for omitted fields.
 * @param {number} id - ID of the user.
 * @param {Object} data - Fields to change.
 * @param {string} [data.name] - Display name.
 * @param {string} [data.email] - Email address.
 * @returns {Object} The updated user row. Throws 404 if not found.
 */
function updateUser(id, data) {
  const existing = getUser(id);
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return usersQueries.update(id, { name, email });
}

/**
 * @description Deletes a user.
 * @param {number} id - ID of the user.
 * @returns {{deleted: boolean}} `{ deleted: true }`. Throws 404 if not found.
 */
function deleteUser(id) {
  if (usersQueries.remove(id) === 0) throw createHttpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
