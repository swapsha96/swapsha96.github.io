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
4.  **Theming**: Checks that switching themes (B button) updates the DOM and persists across page reloads (via `localStorage`). B/X cycles forward, SELECT/Q cycles backward.
5.  **Audio**: Confirms toggling mute (M key) updates state and persists across reloads. The pause-menu SOUND action also updates the HUD mute icon.
6.  **Hardware Features**:
    - **Power Switch**: Verifies the power switch toggles the console on/off.
    - **Konami Code**: Inputs the secret code (Up, Up, Down, Down, Left, Right, Left, Right, B, A) and verifies the "Matrix Mode" visual effect.
7.  **Snake Game**:
    - **Escape hatch**: Left/Right always leave the Snake tab unless the game is actively running.
    - **Pause**: Opening the START menu freezes a running game; closing it resumes seamlessly.
8.  **Pause Menu (START / Escape)**:
    - Opens and closes (START, B, Escape), navigates with Up/Down, activates with A.
    - Actions: RESUME, THEME, SOUND (label updates + persists), HELP, POWER OFF.
9.  **Footer Hints**: The screen footer shows the keymap for the active tab.
10. **Shader Background**: The WebGPU backdrop mirrors the active theme (`data-theme` on the
    `#shader-bg` canvas) and loads lazily — only browsers exposing WebGPU fetch the engine chunk.

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

## Verification Loop

Every change — bug fix, feature, or visual work — goes through the same loop.
Follow it in order; stop only when every gate is green.

### 1. Reproduce (red)

Capture the bug or expected behavior as an automated test **before** touching app code.

- **Logic bugs** → a failing Vitest unit test in `tests/unit/`.
- **User flows** → a failing Playwright test in `tests/e2e/`.
- **Visual work** → reproduce with a Playwright script that screenshots the page
  (see the screenshot snippets in the sections below), or just state the expected
  look and verify it against captures.

Run only the new test and confirm it fails for the right reason:

```bash
npx vitest run tests/unit/<file>.test.ts
npx playwright test -g "<test name>" --project=chromium --reporter=line
```

### 2. Fix (green)

Make the smallest change that turns the new test green. Prefer pure helpers in
`src/lib/` (they get unit tests for free) over inline logic in `.astro` scripts.

### 3. Verify (no regressions)

```bash
npm run test:unit      # unit suite
npx astro check        # types across .astro files
npm run build          # production bundle (also validates lazy chunks/sizes)
npm run test:e2e       # full Playwright suite, all browsers
```

If the change is visual, additionally review actual screenshots:

```bash
# Example: capture the page after it boots
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4321/', { waitUntil: 'load' });
  await p.keyboard.press('Space');       // dismiss the boot overlay
  await p.waitForTimeout(6000);          // let the boot finish
  await p.screenshot({ path: 'shot.png' });
  await b.close();
})();"
```

Notes:

- Playwright tests reuse the running dev server locally (`reuseExistingServer`);
  CI runs them against a fresh `build && preview`.
- WebGPU features do not composite in headless Chromium (software GPU) — verify
  them with a headed browser or by checking `#shader-bg.is-ready` plus layering.
- If a click fails with "element is not stable", the target is inside an animated
  element (e.g. the floating console) — use `page.dispatchEvent(sel, 'click')`.

### 4. Leave it documented

Update this file, `TESTING.md` checklists, or add tests whenever the loop
surfaced something the suite didn't know about. The goal is that the next
change (or the next agent) starts green at a higher bar.

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
