const express = require('express');

const systemRouter = express.Router();

// Static responses with no business logic, so no service call.
systemRouter.get('/', (req, res) => {
  res.json({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
});

systemRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = { systemRouter };
