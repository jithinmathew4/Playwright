# Playwright Tests

[![Playwright Tests](https://github.com/jithinmathew4/Playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/jithinmathew4/Playwright/actions/workflows/playwright.yml)

End-to-end **API, database, UI and performance** test automation written in TypeScript with [Playwright](https://playwright.dev/).

The suite has two parts:

- **Task app tests** run against a small Task Manager app in [`app/`](app/) that Playwright starts automatically. Because the app and its database belong to this repo, the tests can query the DB directly, mock failures and measure performance without touching anyone else's systems.
- **External tests** exercise tricky real-world pages on public demo sites (an internet connection is required).

## Tech stack

- Playwright Test runner (Chromium) with TypeScript
- Express + [Knex](https://knexjs.org/) demo app, running on **SQLite** locally and **PostgreSQL** in CI
- Page Object Model and custom fixtures (`db`, `uniqueTitle`, `createTask`)
- GitHub Actions CI: a matrix runs the suite against SQLite and against a Postgres service container, and uploads an HTML report for each

## How the demo app works

The Task app in [`app/`](app/) is the system under test, not a test itself. It has three layers:

```
 Browser page                Server                    Database
 index.html + app.js  ───▶   server.ts (REST API) ───▶ SQLite / PostgreSQL
```

| File | Role |
| ---- | ---- |
| [`app/public/index.html`](app/public/index.html) | Page layout: a text box, an "Add task" button and the task list |
| [`app/public/app.js`](app/public/app.js) | Browser JavaScript: loads tasks, handles add / tick / delete, shows errors |
| [`app/server.ts`](app/server.ts) | REST API at `/api/tasks`: validates input and reads or writes the database |
| [`app/db.ts`](app/db.ts) | Connects to SQLite (default) or PostgreSQL (`DB_CLIENT=pg`) |
| [`app/schema.ts`](app/schema.ts) | Creates the `tasks` table and inserts 3 sample tasks on startup |

**Example: adding a task**

1. The user types "Buy milk" and clicks **Add task**.
2. `app.js` sends `POST /api/tasks` with `{"title": "Buy milk"}`.
3. `server.ts` validates the title and inserts a row into the `tasks` table.
4. The server responds `201` with `{"id": 4, "title": "Buy milk", "done": false, ...}`.
5. `app.js` adds the new row to the list.

Each kind of test checks a different layer of this flow:

| Test type | What it does |
| --------- | ------------ |
| UI | Drives a real browser: clicks Add task, then checks the page **and** the database |
| API | Skips the page and calls `/api/tasks` directly |
| DB | Sends requests, then queries the table to prove the data was really saved |
| Performance | Times the page load and the API responses against budgets |

**Try it yourself:** run `npm run app:start`, open http://127.0.0.1:3000 and add, tick and delete a few tasks. That is exactly what the UI tests automate. Press `Ctrl+C` to stop the server.

## How the Task app tests fit together

```
 Playwright test ──HTTP──▶ Task app (Express, :3000) ──▶ Database
       │                                                   ▲
       └──────────── db fixture (Knex, direct SQL) ────────┘
```

A test can act through the UI or the API, then check the database directly to prove the change was really saved.

- **Isolation:** every test generates its own unique titles and deletes its rows afterwards, so tests run in parallel safely.
- **Fresh data:** the server resets and seeds the database each time it starts.

## Project structure

```
.
├── .github/workflows/   # CI pipeline (SQLite + PostgreSQL matrix)
├── app/                 # Task Manager demo app: server, DB layer, schema, static UI
├── fixtures/            # Custom Playwright fixtures (db, uniqueTitle, createTask)
├── pages/               # Page objects (LoginPage, TaskApp/TasksPage)
├── tests/
│   ├── API/             # REST API tests against JSONPlaceholder
│   ├── TaskApp/
│   │   ├── api/         # CRUD, validation and edge cases
│   │   ├── db/          # API ↔ database integrity
│   │   ├── ui/          # UI flows verified in the DB, plus network mocking
│   │   └── perf/        # Page-load, Web Vitals and API latency budgets
│   └── UI/
│       ├── HerokuApp/   # The Internet (the-internet.herokuapp.com)
│       └── SauceDemo/   # SauceDemo store
└── playwright.config.ts # Projects: external, app, perf; starts the app via webServer
```

## Setup

```bash
npm install
npx playwright install chromium
```

No database setup is needed: by default the app uses a SQLite file at `data/app.db`.

To use PostgreSQL instead, copy `.env.example` to `.env` and set `DB_CLIENT=pg` and `DATABASE_URL`. `.env` is gitignored, so credentials never reach the repo.

## Run the tests

| Command                 | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm test`              | Run the full suite                            |
| `npm run test:app`      | Task app API, DB and UI tests                 |
| `npm run test:db`       | Task app database tests only                  |
| `npm run test:perf`     | Task app performance budgets                  |
| `npm run test:external` | Tests against public demo sites               |
| `npm run test:ui`       | External UI tests only                        |
| `npm run test:api`      | External API tests only                       |
| `npm run test:headed`   | Run with a visible browser                    |
| `npm run report`        | Open the last HTML report                     |
| `npm run app:start`     | Start the Task app on http://127.0.0.1:3000   |

Performance tests attach their measurements (timings, p50/p95 latency, LCP) to each test in the HTML report.

Playwright is not a load-testing tool. These tests check single-user timing budgets; testing behaviour under many concurrent users would need a dedicated tool such as k6.

Run a single file:

```bash
npx playwright test tests/UI/SauceDemo/Login.spec.ts
```

## Coverage

### Task app

| Area | Spec | What it checks |
| ---- | ---- | -------------- |
| API | `TaskApp/api/tasks.api.spec.ts` | CRUD, status codes, response shape, validation (400), unknown ids (404), malformed JSON, SQL-injection and Unicode input |
| DB | `TaskApp/db/tasks.db.spec.ts` | API writes are persisted, direct inserts are served, PATCH changes only one column, rejected requests write nothing, NOT NULL and default constraints |
| UI | `TaskApp/ui/tasks.ui.spec.ts` | Add, complete and delete tasks, each verified in the DB; validation errors; mocked empty state, API failure and failed update |
| Performance | `TaskApp/perf/page-load.perf.spec.ts` | DOMContentLoaded, load and LCP budgets, including under Slow 4G throttling |
| Performance | `TaskApp/perf/api-latency.perf.spec.ts` | p95 API latency over 30 requests; list API and page render time with 50+ tasks |

### External sites

| Area | Spec | What it checks |
| ---- | ---- | -------------- |
| API | `API/getapi.spec.ts` | GET returns a post |
| API | `API/postapi.spec.ts` | POST creates a post |
| API | `API/putapi.spec.ts` | PUT replaces a post |
| API | `API/patchapi.spec.ts` | PATCH partially updates a post |
| API | `API/deleapi.spec.ts` | DELETE removes a post |
| UI – HerokuApp | `AddRemoveElements.spec.ts` | Adding and removing elements |
| UI – HerokuApp | `BasicAuthentication.spec.ts` | HTTP Basic Authentication |
| UI – HerokuApp | `BrokenImage.spec.ts` | Detecting broken images |
| UI – HerokuApp | `Canvas.spec.ts` | Drawing on a canvas |
| UI – HerokuApp | `ChallengingDom.spec.ts` | Table and row actions on a dynamic DOM |
| UI – SauceDemo | `Login.spec.ts` | Successful login via the `LoginPage` page object |

## License

[MIT](LICENSE)
