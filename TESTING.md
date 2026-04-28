# Testing Strategy

This project uses a robust testing pipeline combining Vitest and Playwright to ensure the `GameBoy` component and site functionality work flawlessly across browsers.

## 1. Unit Testing (Vitest)

Unit tests focus on isolated logic and utility functions that don't depend on browser rendering.

- **Location:** `tests/unit/`
- **Config:** `vitest.config.ts`
- **Command:** `npm run test:unit`

## 2. End-to-End Testing (Playwright)

E2E tests simulate real user interactions in a browser environment. The suite covers 100% of the interactive features of the device.

- **Location:** `tests/e2e/gameboy.spec.ts`
- **Config:** `playwright.config.ts`
- **Command:** `npm run test:e2e`

### Test Coverage

The E2E suite verifies the following user stories:

1.  **Boot Sequence**: Ensures the start overlay appears and is dismissible via keyboard interaction.
2.  **Navigation**:
    - **D-Pad**: Verifies Up/Down navigation correctly updates active links.
    - **Tabs**: Verifies Left/Right navigation switches between Links, About, and Help tabs.
3.  **Selection**: Validates that pressing 'Enter' (A button) triggers link navigation.
4.  **Theming**: Checks that switching themes (B button) updates the DOM and persists across page reloads (via `localStorage`).
5.  **Audio**: Confirms toggling mute (M key) updates state and persists across reloads.
6.  **Hardware Features**:
    - **Power Switch**: Verifies the power switch toggles the console on/off.
    - **Konami Code**: Inputs the secret code (Up, Up, Down, Down, Left, Right, Left, Right, B, A) and verifies the "Matrix Mode" visual effect.

## 3. Static Analysis

Validates `.astro` file syntax and TypeScript types.

- **Command:** `npm run check` (runs `astro check`)

## CI/CD Pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main` and pull requests.

**Workflow Steps:**

1.  **Install**: Sets up Node.js and dependencies.
2.  **Check**: Runs static analysis.
3.  **Unit Tests**: Executes Vitest suite.
4.  **Build**: Compiles the Astro project.
5.  **E2E Tests**: Runs Playwright against the preview build.
6.  **Artifacts**: Uploads failure traces and videos if tests fail.

## Pre-Push Hooks (Husky)

To catch errors before they event reach the CI pipeline, this project uses [Husky](https://typicode.github.io/husky/) to enforce local testing before pushing code to the remote repository.

A `pre-push` hook is configured (in `.husky/pre-push`) to automatically run `npm run test` (which triggers both Unit Tests and E2E Tests) whenever `git push` is invoked locally. If any tests fail, the push is aborted.

This prevents the codebase from bloated `pre-commit` times, while guaranteeing that developers never push broken code to GitHub.

## Debugging

### Interactive Mode (UI)

To debug tests visually, use the Playwright UI mode. This allows you to step through tests, time-travel, and inspect the DOM.

```bash
npx playwright test --ui
```

### Viewing Reports

Playwright generates an HTML report for each run.

```bash
npx playwright show-report
```
