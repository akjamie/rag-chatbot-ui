# Technical Design: UI Dependency Modernization (React 19, MUI v6, Vite 6)

## Architecture & Component Interaction
The Single Page Application preserves its existing component hierarchy and `src/services/api.js` Axios boundary while upgrading the underlying UI runtime and bundler:

```mermaid
flowchart TD
    Browser[User Browser] --> ViteApp[React 19 / Vite 6 App Mount]
    ViteApp --> Router[React Router v7]
    Router --> ThemeProvider[MUI v6 ThemeProvider + Emotion 11.13]
    ThemeProvider --> ChatView[Chat Interface & DocumentIndexPanel / x-date-pickers v7.23+]
    ChatView --> MarkdownRenderer[React Markdown]
    ChatView --> AxiosClient[src/services/api.js Axios Client]
    AxiosClient --> BackendAPI[FastAPI Backend /api/v1]
```

## Interface Contracts & Schemas
- **Backend API Boundary (`src/services/api.js`)**: Existing Axios request/response handling is preserved unchanged (`[UNVERIFIED: sibling rag-chatbot backend /api/v1/chat and /api/v1/history contracts assumed unchanged and not modified by this UI repo]`).
- **Idempotency & Retries**: No automatic retry is added to mutating `POST` chat endpoints; standard user-initiated retry on error remains unchanged.

## Dependency & Peer Resolution Strategy
- **Target Package Ranges** (locked deterministically via `package-lock.json`): `react@^19.0.0`, `react-dom@^19.0.0`, `@types/react@^19.0.0`, `@types/react-dom@^19.0.0`, `@mui/material@^6.1.0`, `@mui/icons-material@^6.1.0`, `@mui/x-date-pickers@^7.23.0`, `react-router-dom@^7.0.0`, `vite@^6.0.0`, `@vitejs/plugin-react@^4.3.4`, `vitest@^3.0.0`.
- **Node.js Engine Floor**: `"engines": { "node": ">=20.0.0" }` (required by `react-router-dom@7.0.0`).
- **Peer Dependency Overrides**: Any third-party peer constraint mismatches are resolved deterministically via `package.json` `overrides` rather than `--legacy-peer-deps`.
- **Security Gate**: `npm audit --audit-level=high` verifies zero high/critical vulnerabilities in the resolved dependency tree.
- **Bundle Budget**: Initial JS bundle size target `<= 500 KB` gzipped (baseline to be recorded from `main` during implementation).
- **Rollback Plan**: `git revert <commit>` restores `package.json` and `package-lock.json` cleanly.

## UI/UX Preservation & Regression Guardrails
- Existing color theme, typography, and layout breakpoints — Mobile (`<= 640px`), Tablet (`641px - 1024px`), and Desktop (`> 1024px`) — are preserved without visual redesign.
- Breakpoint-driven rendering behavior is verified in `vitest + jsdom` using a `window.matchMedia` mock (checking collapsed vs expanded drawer/sidebar states and zero MUI breakpoint warnings).
- Existing interaction states (Default, Hover/Focus, Loading, Empty, Error) are regression-tested under React 19 + MUI v6 with `axe-core` automated accessibility checks.
