---
name: 'React Core Component Architecture'
paths:
  - "React TypeScript projects using Vite"
  - "specifically core UI components and overall directory layout."
alwaysApply: false
description: 'Standardize React TypeScript core component library architecture in Vite by organizing `src/` by responsibility, colocating core components under `src/components/core/` with CSS and `<Component>.test.tsx`, exporting components and Props from `src/components/index.ts`, enforcing typed Props extending native HTML attributes and boolean-filtered class arrays, centralizing design tokens as CSS custom properties in `src/index.css` referenced via `var(--token-name)`, adding a dev-only `/preview` route, and testing with Vitest and Testing Library to improve reusability, consistency, and maintainability.'
---

# Standard: React Core Component Architecture

Standardize React TypeScript core component library architecture in Vite by organizing `src/` by responsibility, colocating core components under `src/components/core/` with CSS and `<Component>.test.tsx`, exporting components and Props from `src/components/index.ts`, enforcing typed Props extending native HTML attributes and boolean-filtered class arrays, centralizing design tokens as CSS custom properties in `src/index.css` referenced via `var(--token-name)`, adding a dev-only `/preview` route, and testing with Vitest and Testing Library to improve reusability, consistency, and maintainability. :
* Colocate component file, CSS file, and test file in the same directory
* Compose CSS class names from an array filtered by Boolean, not string concatenation
* Define a typed Props interface extending native HTML attributes when applicable
* Define all color, spacing, shadow, and radius tokens as CSS custom properties in `src/index.css`
* Export each core component and its Props type from a barrel `src/components/index.ts`
* Organize the `src/` directory by responsibility: `components/`, `pages/`, `services/`, `hooks/`, `contexts/`, `types/`, `utils/`, `config/`, `test/`
* Place reusable UI components in `src/components/core/`
* Provide a dev-only `/preview` route that renders every core component with all variant combinations
* Reference design tokens via `var(--token-name)` in component CSS — never hard-code values
* Scaffold new Vite React projects with `npm create vite@latest <name> -- --template react-ts`
* Write unit tests with Vitest and Testing Library, colocated as `<Component>.test.tsx`

Full standard is available here for further request: [React Core Component Architecture](../../../.packmind/standards/react-core-component-architecture.md)