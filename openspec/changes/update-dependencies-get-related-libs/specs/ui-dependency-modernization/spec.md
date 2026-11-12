# Capability: UI Dependency Modernization

## Purpose
Modernize the user interface frontend dependencies to React 19, Material-UI v6, `@mui/x-date-pickers` v7, React Router v7, and Vite 6 with a Vitest test harness, ensuring clean builds, dev server startup, lint compliance, and regression-free UI rendering across all viewports.

## ADDED Requirements

### Requirement: Modernize Frontend Dependencies and Build Toolchain
The application `package.json` SHALL specify `react@^19.0.0`, `react-dom@^19.0.0`, `@types/react@^19.0.0`, `@types/react-dom@^19.0.0`, `@mui/material@^6.1.0`, `@mui/icons-material@^6.1.0`, `@mui/x-date-pickers@^7.22.0`, `@emotion/react@^11.13.5`, `@emotion/styled@^11.13.5`, `react-router-dom@^7.0.0`, `vite@^6.0.0`, `@vitejs/plugin-react@^4.3.4`, and Vitest test dependencies, and MUST compile, lint, and pass `npm audit --audit-level=high` without fatal errors.

#### Scenario: Resolve dependencies, lint, and build production bundle
- **GIVEN** a Node.js `>=18.0.0` runtime environment
- **WHEN** dependencies in `package.json` are installed using `npm` `overrides` (without `--legacy-peer-deps`) and `npm run lint` and `npm run build` execute
- **THEN** ESLint reports 0 warnings/errors and Vite compiles assets into `dist/` with 0 build errors and initial JS bundle size `<= 500 KB` gzipped.

#### Scenario: Verify Vite dev server startup and security audit
- **GIVEN** the upgraded `package.json` and `package-lock.json`
- **WHEN** `npm audit --audit-level=high` runs and the Vite dev server boots
- **THEN** zero high/critical vulnerabilities remain and the dev server responds with HTTP 200 without React 19 console/hydration errors.

**Acceptance criteria**
- [ ] AC1: `package.json` specifies exact target versions (`react@^19.0.0`, `@mui/material@^6.1.0`, `@mui/x-date-pickers@^7.22.0`, `@types/react@^19.0.0`, `react-router-dom@^7.0.0`, `vite@^6.0.0`, `@vitejs/plugin-react@^4.3.4`, `vitest`) and `npm run build` succeeds (test: tests/build.test.js)
- [ ] AC2: `npm run lint` passes with 0 warnings and `npm audit --audit-level=high` exits 0 with initial JS bundle `<= 500 KB` gzipped (test: tests/build.test.js)

### Requirement: Responsive Layout and Mandatory Interaction States Regression
The chat UI MUST preserve responsive rendering across mobile (`<=640px`), tablet (`641px-1024px`), and desktop (`>1024px`) viewports, and MUST render loading, empty, and error states with zero critical `axe-core` accessibility violations.

#### Scenario: Display responsive chat interface across mobile, tablet, and desktop viewports
- **GIVEN** a user accessing the application on mobile (`375px`), tablet (`768px`), or desktop (`1440px`) viewports
- **WHEN** the chat page renders under React 19 and MUI v6
- **THEN** navigation sidebars and input containers adapt across all three breakpoints without horizontal overflow.

#### Scenario: Render loading, empty, and error states with accessibility compliance
- **GIVEN** an active chat view undergoing state changes (initial empty state, loading response, or API error)
- **WHEN** each state renders and is scanned by `axe-core`
- **THEN** loading indicators, empty prompt starters, and error feedback render cleanly with zero critical `axe-core` accessibility violations and zero React console warnings.

**Acceptance criteria**
- [ ] AC3: Responsive layouts render without horizontal overflow on mobile (`<=640px`), tablet (`641px-1024px`), and desktop (`>1024px`) viewports (test: tests/components/ResponsiveLayout.test.jsx)
- [ ] AC4: Loading, empty, and error states render without React 19 warnings and pass `axe-core` with 0 critical accessibility violations (test: tests/components/ChatStates.test.jsx)

## Constraints & NFRs
- Initial JS production bundle size SHALL remain `<= 500 KB` gzipped (verified in AC2).
- Node.js runtime SHALL be `>= 18.0.0` (`engines.node`).

## Out of Scope
- Migrating to a server-side rendered (Next.js / Remix) framework.
- Redesigning the visual color palette or adding unrequested WebSocket/retry features.

## Test Strategy
Automated component, build, and accessibility testing using Vitest, React Testing Library, `jsdom`, and `axe-core`. `tests/build.test.js` validates `package.json` pins, `npm run build`, `npm run lint`, bundle size budget, and `npm audit --audit-level=high`. Component tests in `tests/components/` verify React 19 mounting, responsive breakpoints (mobile/tablet/desktop), and `axe-core` accessibility across interaction states.
