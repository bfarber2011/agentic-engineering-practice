const { db } = require('../connection');

function findAll() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

function findById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

function create(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findById(result.lastInsertRowid);
}

module.exports = { findAll, findById, create };
