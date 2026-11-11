# Proposal: Modernize Frontend Dependencies to React 19, MUI v6, and Vite 6

## Why
The UI frontend currently runs on Vite 4, React 18.2, and older MUI 5 packages. Upgrading to the modern bleeding edge toolchain (React 19, MUI v6, and Vite 6) improves hot-module replacement (HMR) speeds, resolves security vulnerabilities in build tools, leverages modern React compiler/hooks advancements, and delivers higher fidelity UI rendering.

## What Changes
- Upgrade `package.json`:
  - `react`: `^19.0.0`
  - `react-dom`: `^19.0.0`
  - `@mui/material`: `^6.1.0`
  - `@mui/icons-material`: `^6.1.0`
  - `@emotion/react`: `^11.13.0`
  - `@emotion/styled`: `^11.13.0`
  - `vite`: `^6.0.0`
  - `@vitejs/plugin-react`: `^4.3.0`
  - `react-router-dom`: `^6.28.0` / `^7.0.0`
- Update Vite build configuration and plugin settings for Vite 6 compatibility.
- Ensure all styled components, dialogs, and markdown renderers function without hydration or type warnings under React 19.

## Capabilities
### Bleeding Edge Web UI
- Fast developer server startup and HMR via Vite 6.
- Modernized Material-UI v6 visual system with full dark/light theme support.

## Impact
- **Codebase**: `package.json`, `vite.config.js`, root component mounts.
- **Build**: `npm run build` and `npm run dev` lifecycle scripts.
- **Tests**: Component rendering and visual regression verification.

## Out of Scope
- Redesigning the core user journey or backend API communication contracts.

## Dependencies & Assumptions
- Node.js >= 20.19 runtime.
- npm peer-dependency resolution flags if needed during React 19 / Emotion transition.

