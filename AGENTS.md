# Repository Guidelines

## Project Structure & Module Organization

Source files live in `src/`. `card.js` renders the dashboard card and invokes Home Assistant services;
`editor.js` owns visual configuration; `model.js` performs entity discovery and builds the switch model;
`localize.js` contains UI strings; and `styles.js` contains Lit CSS. Unit tests are under `test/`. The
release bundle is generated at `dist/tplink-easy-smart-card.js`; do not edit it by hand. Build automation
is in `scripts/`, while HACS and GitHub metadata live in `hacs.json` and `.github/`.

## Build, Test, and Development Commands

Use Node.js 20 or newer from the repository root:

- `npm ci` installs the exact dependencies from `package-lock.json`.
- `npm test` runs the Vitest suite once.
- `npm run lint` checks JavaScript with ESLint.
- `npm run format:check` checks formatting with Prettier.
- `npm run build` bundles and minifies the card with esbuild.
- `npm run check` runs every release gate locally.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, semicolons, and double quotes. Prettier is authoritative. Use
`camelCase` for functions and variables, `PascalCase` for custom-element classes, and uppercase names
for constants. Keep entity discovery in `model.js` and key it by registry `device_id` and stable
integration unique IDs, never by a user-editable entity name. Omit unsupported capabilities rather than
rendering unavailable placeholders. Keep actions keyboard accessible and theme colors based on Home
Assistant CSS variables.

## Testing Guidelines

Tests use Vitest and follow `test/<area>.test.js`. Add focused tests for entity matching, renamed entity
IDs, model aggregation, formatting, and regressions. UI changes should also be checked in narrow and wide
Sections dashboard layouts. Tests must not contact a real switch or Home Assistant instance.

## Commit & Pull Request Guidelines

Use concise, imperative commit subjects such as `Add cable diagnostics` or `Fix renamed entity lookup`.
Keep each commit scoped. Pull requests must explain the user-visible change, list validation performed,
link related issues, and include screenshots for visual changes. Never commit credentials, session
cookies, IP addresses from private installations, or unredacted diagnostics. Releases use calendar tags
such as `2026.9.0`; update `package.json` and `CHANGELOG.md` together.
