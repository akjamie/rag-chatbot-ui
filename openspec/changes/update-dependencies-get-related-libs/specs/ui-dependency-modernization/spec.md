# Capability: UI Dependency Modernization

## Purpose
Modernize the user interface frontend dependencies to React 19, Material-UI v6, `@mui/x-date-pickers` v7.23+, React Router v7, and Vite 6 with a Vitest test harness, ensuring clean builds, lint compliance, security audit pass, and regression-free UI rendering across all breakpoints.

## ADDED Requirements

### Requirement: Modernize Frontend Dependencies and Build Toolchain
The application `package.json` SHALL specify `react@^19.0.0`, `react-dom@^19.0.0`, `@types/react@^19.0.0`, `@types/react-dom@^19.0.0`, `@mui/material@^6.1.0`, `@mui/icons-material@^6.1.0`, `@mui/x-date-pickers@^7.23.0`, `@emotion/react@^11.13.5`, `@emotion/styled@^11.13.5`, `react-router-dom@^7.0.0`, `vite@^6.0.0`, `@vitejs/plugin-react@^4.3.4`, and `vitest@^3.0.0` (target ranges made deterministic by `package-lock.json`), and MUST compile, lint, and pass `npm audit --audit-level=high` without fatal errors on Node.js `>=20.0.0`.

#### Scenario: Resolve dependencies, lint, audit, and build production bundle
- **GIVEN** a Node.js `>=20.0.0` runtime environment
- **WHEN** dependencies in `package.json` are installed using `npm` `overrides` (without `--legacy-peer-deps`) and `npm run lint`, `npm audit --audit-level=high`, and `npm run build` execute
- **THEN** ESLint reports 0 warnings/errors, `npm audit` exits 0, and Vite compiles assets into `dist/` with 0 build errors and initial JS bundle size `<= 500 KB` gzipped.

**Acceptance criteria**
- [ ] AC1: `package.json` specifies target ranges (`react@^19.0.0`, `@mui/material@^6.1.0`, `@mui/x-date-pickers@^7.23.0`, `@types/react@^19.0.0`, `react-router-dom@^7.0.0`, `vite@^6.0.0`, `@vitejs/plugin-react@^4.3.4`, `vitest@^3.0.0`) made deterministic by `package-lock.json`, and `npm run build` succeeds (test: tests/build.test.js)
- [ ] AC2: `npm run lint` passes with 0 warnings and `npm audit --audit-level=high` exits 0 with initial JS bundle `<= 500 KB` gzipped (test: tests/build.test.js)

### Requirement: Responsive Layout and Mandatory Interaction States Regression
The chat UI MUST preserve breakpoint-driven rendering behavior across mobile (`<=640px`), tablet (`641px-1024px`), and desktop (`>1024px`) viewports (verified via `window.matchMedia` mocks in `jsdom`), and MUST render loading, empty, and error states with zero critical `axe-core` accessibility violations.

#### Scenario: Render breakpoint-driven navigation across mobile, tablet, and desktop viewports
- **GIVEN** a `vitest + jsdom` environment with mocked `window.matchMedia` for mobile (`375px`), tablet (`768px`), and desktop (`1440px`) breakpoints
- **WHEN** the chat layout renders under React 19 and MUI v6
- **THEN** the navigation sidebar adapts its collapsed/expanded state across all three breakpoints with zero MUI breakpoint or React console warnings.

#### Scenario: Render loading, empty, and error states with accessibility compliance
- **GIVEN** an active chat view undergoing state changes (initial empty state, loading response, or API error)
- **WHEN** each state renders and is scanned by `axe-core`
- **THEN** loading indicators, empty prompt starters, and error feedback render cleanly with zero critical `axe-core` accessibility violations and zero React console warnings.

**Acceptance criteria**
- [ ] AC3: Breakpoint-driven sidebar/layout rendering adapts across mobile (`<=640px`), tablet (`641px-1024px`), and desktop (`>1024px`) `matchMedia` mocks with zero MUI/React warnings (test: tests/components/ResponsiveLayout.test.jsx)
- [ ] AC4: Loading, empty, and error states render without React 19 warnings and pass `axe-core` with 0 critical accessibility violations (test: tests/components/ChatStates.test.jsx)

## Constraints & NFRs
- Initial JS production bundle size SHALL remain `<= 500 KB` gzipped (verified in AC2).
- Node.js runtime SHALL be `>= 20.0.0` (`engines.node`, required by `react-router-dom@7.0.0`).

## Out of Scope
- Migrating to a server-side rendered (Next.js / Remix) framework.
- Redesigning the visual color palette or adding unrequested WebSocket/retry features.

## Test Strategy
Automated component, build, and accessibility testing using Vitest (`^3.0.0`), React Testing Library, `jsdom`, and `axe-core`. `tests/build.test.js` validates `package.json` target ranges, `npm run build`, `npm run lint`, bundle size budget, and `npm audit --audit-level=high`. Component tests in `tests/components/` verify React 19 mounting, `window.matchMedia` breakpoint-driven rendering (mobile/tablet/desktop), and `axe-core` accessibility across interaction states.
