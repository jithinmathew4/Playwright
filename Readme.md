# Playwright Tests

[![Playwright Tests](https://github.com/jithinmathew4/Playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/jithinmathew4/Playwright/actions/workflows/playwright.yml)

End-to-end UI and API test automation written in TypeScript with [Playwright](https://playwright.dev/). The tests exercise public demo sites, so an internet connection is required.

## Tech stack

- Playwright Test runner (Chromium)
- TypeScript
- Page Object Model for UI pages
- GitHub Actions CI with an HTML report uploaded on every run

## Project structure

```
.
├── .github/workflows/   # CI pipeline
├── pages/               # Page objects
├── tests/
│   ├── API/             # REST API tests (GET, POST, PUT, PATCH, DELETE)
│   └── UI/
│       ├── HerokuApp/   # The Internet (the-internet.herokuapp.com)
│       └── SauceDemo/   # SauceDemo store
└── playwright.config.ts
```

## Setup

```bash
npm install
npx playwright install chromium
```

## Run the tests

| Command               | What it does                     |
| --------------------- | -------------------------------- |
| `npm test`            | Run the full suite               |
| `npm run test:ui`     | Run UI tests only                |
| `npm run test:api`    | Run API tests only               |
| `npm run test:headed` | Run with a visible browser       |
| `npm run report`      | Open the last HTML report        |

Run a single file:

```bash
npx playwright test tests/UI/SauceDemo/Login.spec.ts
```

## Coverage

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
