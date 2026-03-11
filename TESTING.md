# Testing Strategy

This project uses a comprehensive testing pipeline ensuring the `GameBoy` component and site functionality are robust.

## 1. Unit Testing (Vitest)
Used for testing isolated logic and utility functions.
- **Config:** `vitest.config.ts`
- **Command:** `npm run test:unit`
- **Location:** `tests/unit/`

## 2. End-to-End Testing (Playwright)
Used for simulating user interactions (clicks, keyboard navigation, theme switching) in real browsers.
- **Config:** `playwright.config.ts`
- **Command:** `npm run test:e2e`
- **Location:** `tests/e2e/`
- **Browsers:** Chromium, Firefox, WebKit. (Chromium runs in CI/local, others configured).

## 3. Static Analysis
- **Command:** `npm run check`
- Uses `@astrojs/check` to validate `.astro` files.

## CI/CD Pipeline
A GitHub Actions workflow is defined in `.github/workflows/ci.yml`.
It runs on every push and PR to `main`:
1. Installs dependencies.
2. Runs static analysis (`npm run check`).
3. Runs unit tests.
4. Builds the project.
5. Runs E2E tests against the preview build.
6. Uploads artifacts (videos/traces) on failure.

## How to add tests
- **Unit:** Add `*.test.ts` files in `tests/unit/`.
- **E2E:** Add `*.spec.ts` files in `tests/e2e/`.

## Debugging E2E Tests
To run E2E tests with UI mode:
```bash
npx playwright test --ui
```
This allows you to see the browser, time travel through steps, and inspect DOM.
