const express = require('express');
const commentsService = require('../services/comments-service');

// Mounted at /tasks/:id/comments
const commentsRouter = express.Router({ mergeParams: true });

commentsRouter.get('/', (req, res, next) => {
  try {
    res.json(commentsService.listComments(parseInt(req.params.id)));
  } catch (err) {
    next(err);
  }
});

commentsRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(commentsService.addComment(parseInt(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsRouter };
