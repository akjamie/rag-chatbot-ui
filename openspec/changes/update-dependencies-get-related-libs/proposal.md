# Proposal: Modernize Frontend Dependencies to React 19, MUI v6, and Vite 6

**Change ID**: `update-dependencies-get-related-libs`

## Why
The UI frontend currently runs on Vite 4 (`^4.5.5`), React 18.2.0, and older MUI 5 packages. Upgrading to the modern React 19, MUI v6, and Vite 6 toolchain improves build and HMR performance, resolves build-tool security advisories, and ensures compatibility with modern React ecosystems.

## What Changes
- **BREAKING** major framework upgrades in `package.json`:
  - `react`: `^19.0.0`, `react-dom`: `^19.0.0`
  - `@types/react`: `^19.0.0`, `@types/react-dom`: `^19.0.0`
  - `@mui/material`: `^6.1.0`, `@mui/icons-material`: `^6.1.0`
  - `@mui/x-date-pickers`: `^7.22.0` (required for React 19 + MUI v6 peer compatibility in `DocumentIndexPanel.jsx`)
  - `@emotion/react`: `^11.13.5`, `@emotion/styled`: `^11.13.5`
  - `react-router-dom`: `^7.0.0`
  - `vite`: `^6.0.0`, `@vitejs/plugin-react`: `^4.3.4`
- Configure `npm` `overrides` in `package.json` for deterministic peer-dependency resolution (avoiding `--legacy-peer-deps`) and set `"engines": { "node": ">=18.0.0" }`.
- Add test harness in `devDependencies` (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `axe-core`) and `"test": "vitest run"` script.
- Verify `src/services/api.js` (Axios client) and existing component rendering, `npm run dev`, `npm run lint`, and `npm run build` execute cleanly with zero warnings or errors.
- Enforce `npm audit --audit-level=high` in verification.
- **Rollback Plan**: Revert the dependency upgrade commit and restore `package.json` + `package-lock.json` cleanly via `git revert`.

## Capabilities
### UI Dependency Modernization
- Fast developer server startup, linting, and production builds via Vite 6.
- React 19 + Material-UI v6 + `@mui/x-date-pickers` v7 runtime compatibility with zero hydration or type warnings.

## Impact
- **Codebase**: `package.json`, `package-lock.json`, `vite.config.js`, root component mounts, `DocumentIndexPanel.jsx`, `src/services/api.js`, and new `tests/` suite.
- **Build & Scripts**: `npm run dev`, `npm run build`, `npm run lint`, `npm test`.
- **Tests**: Vitest + React Testing Library + axe-core verification suite in `tests/`.

## Out of Scope
- Redesigning the visual theme, color palette, or typography.
- Adding new WebSocket streaming hooks or automatic retry logic on non-idempotent `POST` requests.
- Modifying backend API contracts in `rag-chatbot` (`[UNVERIFIED: backend /api/v1/chat contract assumed unchanged]`).

## Dependencies & Assumptions
- Node.js `>=18.0.0` runtime (Vite 6 minimum requirement).
- Peer compatibility of `@react-oauth/google` and `react-markdown` with React 19 resolved via `npm` `overrides` if needed `[UNVERIFIED: requires npm install verification during implementation]`.
