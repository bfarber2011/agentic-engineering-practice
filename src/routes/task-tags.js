const express = require('express');
const taskTagsService = require('../services/task-tags-service');

// Mounted at /tasks/:id/tags
const taskTagsRouter = express.Router({ mergeParams: true });

taskTagsRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(taskTagsService.addTagToTask(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

taskTagsRouter.delete('/:tagId', (req, res, next) => {
  try {
    const result = taskTagsService.removeTagFromTask(
      parseInt(req.params.id),
      parseInt(req.params.tagId)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = { taskTagsRouter };
