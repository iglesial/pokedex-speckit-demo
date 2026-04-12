# Packmind Standards Index

This standards index contains all available coding standards that can be used by AI agents (like Cursor, Claude Code, GitHub Copilot) to find and apply proven practices in coding tasks.

## Available Standards

- [React Core Component Architecture](./standards/react-core-component-architecture.md) : Standardize React TypeScript core component library architecture in Vite by organizing `src/` by responsibility, colocating core components under `src/components/core/` with CSS and `<Component>.test.tsx`, exporting components and Props from `src/components/index.ts`, enforcing typed Props extending native HTML attributes and boolean-filtered class arrays, centralizing design tokens as CSS custom properties in `src/index.css` referenced via `var(--token-name)`, adding a dev-only `/preview` route, and testing with Vitest and Testing Library to improve reusability, consistency, and maintainability.


---

*This standards index was automatically generated from deployed standard versions.*