const express = require('express');
const { PORT } = require('./utils/constants');
const { requestLogger } = require('./middleware/request-logger');
const { errorHandler } = require('./middleware/error-handler');
const { systemRouter } = require('./routes/system');
const { webhooksRouter } = require('./routes/webhooks');
const { usersRouter } = require('./routes/users');
const { projectsRouter } = require('./routes/projects');
const { tasksRouter } = require('./routes/tasks');
const { commentsRouter } = require('./routes/comments');
const { taskTagsRouter } = require('./routes/task-tags');
const { tagsRouter } = require('./routes/tags');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/', systemRouter);
app.use('/webhooks', webhooksRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/tasks', tasksRouter);
app.use('/tasks/:id/comments', commentsRouter);
app.use('/tasks/:id/tags', taskTagsRouter);
app.use('/tags', tagsRouter);

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
