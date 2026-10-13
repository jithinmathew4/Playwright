# Playwright Tests

A small Playwright end-to-end test project using the Chromium browser. The tests exercise public demo sites, so an internet connection is required.

## Setup

Install the project dependencies and the Chromium browser:

```bash
npm install
npx playwright install chromium
```

## Run the tests

Run the full test suite:

```bash
npx playwright test
```

Run tests with a visible browser window:

```bash
npx playwright test --headed
```

Run one test file:

```bash
npx playwright test tests/addElements.spec.js
npx playwright test tests/Login.spec.js
```

Open the HTML report after a test run:

```bash
npx playwright show-report
```

## Current coverage

- `tests/addElements.spec.js` checks adding and removing elements on The Internet's Add/Remove Elements page.
- `tests/Login.spec.js` checks a successful login on the SauceDemo demo store.

Playwright configuration is in `playwright.config.ts`; browser projects and reporter settings can be adjusted there.
