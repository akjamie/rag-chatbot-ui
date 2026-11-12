# Clarifications: update-dependencies-get-related-libs

> Requirement: "update the dependencies to get related libs/models to be updated and get it running,"
> Mode: interactive (grill-me)

## Requirement
"update the dependencies to get related libs/models to be updated and get it running,"

## Settled decisions
- **Bleeding Edge UI Framework Upgrade**: Upgrade frontend stack to React 19 (`^19.0.0`), React DOM (`^19.0.0`), `@types/react` (`^19.0.0`), `@types/react-dom` (`^19.0.0`), Material-UI v6 (`@mui/material ^6.1.0`, `@mui/icons-material ^6.1.0`), `@mui/x-date-pickers ^7.22.0` (React 19 + MUI v6 compatible), `react-router-dom ^7.0.0`, Vite 6 (`vite ^6.0.0`, `@vitejs/plugin-react ^4.3.4`).
- **Test Harness & Tooling**: Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `vitest-axe` / `axe-core` to `devDependencies` with `"test": "vitest run"` in `package.json`.
- **Peer Dependency Resolution**: Prefer `npm` `overrides` in `package.json` over `--legacy-peer-deps` for deterministic lockfile resolution; enforce `npm audit --audit-level=high`.
- **Scope Boundary**: Preserve existing UI styling and `src/services/api.js` HTTP client behavior without adding unrequested WebSocket hooks or automatic `POST` retries. `[UNVERIFIED: backend /api/v1/chat contract assumed unchanged in sibling rag-chatbot repo]`.

## Open questions
<!-- None. All questions settled. -->
