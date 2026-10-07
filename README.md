# Hey! 👋

My personal site — a **Game Boy Advance** you can play with, built with [Astro](https://astro.build). It powers <https://swapnil.wtf>.

Press any key to boot, then:

| Control | Action |
| --- | --- |
| `↑ ↓` / `W S` | Navigate links / scroll panels |
| `← →` / `A D` | Change tabs (steer in Snake) |
| `Enter` / `Z` / `A` | Select / open link |
| `B` / `X` | Next theme |
| `SELECT` / `Q` | Previous theme |
| `START` / `Esc` | Pause menu (resume, theme, sound, help, power) |
| `H` | Help tab |
| `M` | Mute |
| `O` | Rotate console |
| `P` | Power / snake skin |
| Secret | `↑ ↑ ↓ ↓ ← → ← → B A` |

## Stack

- **Astro 6** — static output, zero client-side framework; everything interactive
  is vanilla TypeScript in `src/lib/`
- **shaders** ([shaders.com](https://shaders.com), MIT) — an animated WebGPU
  backdrop behind the console, theme-reactive and lazy-loaded (only browsers
  with WebGPU fetch the engine chunk)
- **Playwright + Vitest** — 105 e2e tests across Chromium/Firefox/WebKit/mobile
  plus 65 unit tests; axe-core audits six UI states for accessibility

## Development

```bash
npm install
npm run dev        # http://localhost:4321
```

## Verification loop

Every change goes red → green → full gates:

```bash
npm run test:unit   # unit suite
npm run check       # astro type check
npm run build       # production bundle
npm run test:e2e    # Playwright, all browsers (includes axe audits)
```

See [`TESTING.md`](TESTING.md) for the full strategy and debugging tips
(`npx playwright test --ui`, screenshot recipes, headless-WebGPU caveats).

## Deployment

GitHub Actions (`ci.yml`) runs the full gate on every push to `main` and then
deploys `dist/` to GitHub Pages.
