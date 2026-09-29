const usersQueries = require('../db/queries/users-queries');
const { sendEmail } = require('./email-service');
const { validateEmail, isNonEmptyString } = require('../utils/validation');
const { createHttpError } = require('../utils/http-error');
const { isUniqueViolation } = require('../utils/db-errors');

function listUsers() {
  return usersQueries.findAll();
}

function getUser(id) {
  const user = usersQueries.findById(id);
  if (!user) throw createHttpError(404, 'User not found');
  return user;
}

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

function updateUser(id, data) {
  const existing = getUser(id);
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return usersQueries.update(id, { name, email });
}

function deleteUser(id) {
  if (usersQueries.remove(id) === 0) throw createHttpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
