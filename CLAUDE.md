# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run db:seed      # create schema + seed taskr.db (5 users, 3 projects, 20 tasks, 15 comments, 8 tags)
npm run db:reset      # delete taskr.db and re-seed
npm run dev           # node --watch src/index.js: start server with file watching (Node 18+), port 3000
npm start             # node src/index.js: start server without watching
npm test              # run full Jest suite
npm run test:watch    # Jest in watch mode
```

To run a single test file: `npx jest tests/tasks.test.js`. To run one test by name: `npx jest -t "returns empty array"`.

Tests run against an in-memory SQLite database (`NODE_ENV=test` forces `src/db/connection.js` to use `:memory:`) and create the schema via `createSchema(db)` from `src/db/schema.js` — no `taskr.db` or seed step required for `npm test`.

Jest only picks up `tests/*.test.js` (see `jest.testMatch` in `package.json`). New test files must be named `resource.test.js` (e.g. `comments.test.js`) or they will silently never run.

## Folder structure

Taskr is a small Express + better-sqlite3 REST API (see README.md for the resource list: `/users`, `/projects`, `/tasks`, `/tasks/:id/comments`, `/tags`). The entry point is `src/index.js`, and all code lives under `src/` in strict layers:

**routes → services → queries → database connection** (`src/routes/` call `src/services/`, which call `src/db/queries/`, which use the shared connection in `src/db/connection.js`).

```
src/
  index.js        app wiring only: json parser, request logger, routers, error handler, listen
  routes/         HTTP layer, one router per resource (users.js, tasks.js, comments.js, task-tags.js, ...)
  services/       business logic + validation (users-service.js, tasks-service.js, ..., email-service.js)
  db/
    connection.js the single shared better-sqlite3 connection (:memory: when NODE_ENV=test)
    schema.js     createSchema(db), shared by seed.js and the tests
    seed.js       dev seed script (skips if users is non-empty)
    queries/      raw SQL, one file per table (users-queries.js, tasks-queries.js, ...)
  middleware/     authenticate.js, request-logger.js, error-handler.js
  utils/          constants.js, validation.js, http-error.js, db-errors.js
tests/            supertest suites, one per resource (tasks.test.js, users.test.js, projects.test.js)
```

### Layer rules

- **routes → services → db/queries.** A layer only calls the one below it. `connection.js` is imported only by `db/queries/*`, `seed.js` and the tests.
- **Routes** only translate HTTP: parse `req` (`parseInt(req.params.id)`, body, query), call one service function, send the result. No SQL, no validation, no inline error responses. Every handler is `try { ... } catch (err) { next(err) }`. Each file exports a named router (`module.exports = { tasksRouter }`), registered in `src/index.js` with `app.use(path, router)`. Nested routers (`comments.js`, `task-tags.js`) use `Router({ mergeParams: true })` and are mounted at `/tasks/:id/comments` and `/tasks/:id/tags`. The one exemption is `routes/system.js` (`GET /`, `GET /health`), which returns static JSON without a service.
- **Services** own validation and business rules (e.g. the `completed_at` logic in `tasks-service.js`). They fail by throwing `createHttpError(status, message)` from `utils/http-error.js`, and they never touch `req`/`res`. They translate SQLite `UNIQUE` errors (via `utils/db-errors.js`) into 409s.
- **Queries** return raw rows or change counts and know nothing about HTTP.
- **Errors** are handled centrally by `middleware/error-handler.js`, which responds `{ error: message }` with `err.status || 500`. Stack traces are logged only for 5xx.
- **Auth is a stub**: `middleware/authenticate.js` checks a static `x-api-key` header against `process.env.API_KEY` (default `'dev-key'`) — not real JWT/session auth. It currently only guards `DELETE /users/:id` and `DELETE /projects/:id`; other destructive routes (e.g. `DELETE /tasks/:id`) are unguarded.
- **Emails are stubbed**: `services/email-service.js` just logs and resolves; `users-service.createUser` awaits it after inserting the user (welcome email).

### Database schema

SQLite tables: `users`, `projects` (owned by a user), `tasks` (belongs to a project, assigned to a user, `status` is one of `active`/`completed`/`archived` via CHECK constraint), `comments` (on a task, by a user), `tags`, and `task_tags` (many-to-many join). The schema is defined once, in `src/db/schema.js`.

## Naming conventions

- **All files and directories use kebab-case**, e.g. `task-tags.js`, `tasks-service.js`, `error-handler.js`. No camelCase, PascalCase or snake_case file names.
- Suffix files by layer: `src/routes/<resource>.js`, `src/services/<resource>-service.js`, `src/db/queries/<resource>-queries.js`.
- Test files are `tests/<resource>.test.js`.

## Conventions

- Add a new endpoint by creating or extending `src/routes/<resource>.js`, `src/services/<resource>-service.js` and `src/db/queries/<resource>-queries.js`, then registering the router in `src/index.js`.
- Put helpers in the most specific module that fits; only add to `src/utils/` when something is genuinely shared across layers.
- Don't add files whose only purpose is to keep old code "just in case" — git history is the archive.

## Context Files

- **`.claude/context/api-conventions.md`** — read this for any task involving API routes or endpoints.
- **`.claude/context/testing-standards.md`** — read this for any task involving tests or test coverage.
