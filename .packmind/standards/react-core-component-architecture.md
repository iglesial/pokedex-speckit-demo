# React Core Component Architecture

Defines the file structure, theming approach, component patterns, testing conventions, and dev preview route for a reusable React core component library built with Vite.

## Rules

* Place reusable UI components in `src/components/core/`
* Colocate component file, CSS file, and test file in the same directory
* Export each core component and its Props type from a barrel `src/components/index.ts`
* Define a typed Props interface extending native HTML attributes when applicable
* Compose CSS class names from an array filtered by Boolean, not string concatenation
* Define all color, spacing, shadow, and radius tokens as CSS custom properties in `src/index.css`
* Reference design tokens via `var(--token-name)` in component CSS — never hard-code values
* Provide a dev-only `/preview` route that renders every core component with all variant combinations
* Write unit tests with Vitest and Testing Library, colocated as `<Component>.test.tsx`
* Organize the `src/` directory by responsibility: `components/`, `pages/`, `services/`, `hooks/`, `contexts/`, `types/`, `utils/`, `config/`, `test/`
* Scaffold new Vite React projects with `npm create vite@latest <name> -- --template react-ts`
