# Clarifications: update-dependencies-get-related-libs

> Requirement: "update the dependencies to get related libs/models to be updated and get it running,"
> Mode: interactive (grill-me)

## Requirement
"update the dependencies to get related libs/models to be updated and get it running,"

## Settled decisions
- **Bleeding Edge UI Framework Upgrade**: Upgrade frontend stack to modern React 19 / React DOM 19, Material-UI (MUI v6), Vite 6 build tooling, and modern React Router.
- **Emotion & Peer Dependency Handling**: Configure npm peer dependency resolutions or override settings where Emotion and React 19 types align, ensuring clean build and dev server execution.
- **Visual Design & State Polish**: Comply with frontend design best practices (WCAG contrast, responsive breakpoints, loading skeletons, error states).

## Open questions
<!-- None. All questions settled. -->
