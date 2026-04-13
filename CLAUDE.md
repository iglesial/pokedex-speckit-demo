# pokedex-speckit-demo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-12

## Active Technologies

- TypeScript 5.x, React 18.x + Vite (dev/build), React Router (routing), TanStack Query / React Query (PokeAPI data fetching + cache), native `fetch` (no axios needed) (001-pokedex-mvp)

## Project Structure

Colocated core components at `src/components/core/<Name>/`, each with `.tsx`
+ `.css` + `<Name>.test.tsx`. Page-level composition under `src/pages/<Name>/`.
Barrel export from `src/components/index.ts`. Hooks in `src/hooks/`, services
in `src/services/`, shared types in `src/types/`, config constants in
`src/config/`, utilities in `src/utils/`, MSW fixtures in `src/test/handlers/`.

## Commands

```
npm run dev         # Vite dev server
npm test            # Vitest watch
npm run test:run    # Single-run for CI
npm run typecheck   # tsc -b --noEmit
npm run build       # tsc + vite build
```

## Code Style

- TypeScript 5.x strict, React 18.x
- Core components expose a single typed Props interface extending native HTML
  attributes where applicable; class composition via `cx(...)` (boolean-filtered).
- Design tokens (colors, spacing, radius, shadow, motion) in `src/index.css`
  as CSS custom properties. Never hard-code visual values in component CSS.
- All motion ≤ 250ms for micro-interactions; reduced-motion globally zeroed
  via `@media (prefers-reduced-motion: reduce)` in `src/index.css`.
- URL is the single source of truth for discovery state on the catalog page
  (`?q`, `?types`, `?page`). Do not mirror into React state.
- PokeAPI is reached only via `src/services/pokeapi.ts`; no raw `fetch` from
  components or pages.
- Test-first per constitution principle III: colocated `<Component>.test.tsx`
  with Vitest + Testing Library; MSW for request mocking; `jest-axe` for a11y
  audits on page-level components.
- `/preview` (dev-only, code-split) is the visual-review surface; every new
  core component must have an entry covering all variants.

## Recent Changes

- 002-pokemon-catalog (Phase 6 Polish): `/preview` route code-split via
  React.lazy so it never ships to production; automated a11y audit via
  jest-axe on HomePage (heading-order fix: Card now uses `<h2>`).
- 002-pokemon-catalog (Phase 5, US3): type-filter chips with AND semantics,
  three-variant empty state copy/CTA matrix based on active controls.
- 002-pokemon-catalog (Phase 4, US2): header search by partial name / exact
  National Dex ID, debounced 150ms with stale-debounce guard for external
  clears; keyboard handoff (ArrowDown from input to first card).
- 002-pokemon-catalog (Phase 1-3, US1): grid + pagination + URL-resident
  state + scroll restoration + error/skeleton states.
- 001-pokedex-mvp: Scoping spec. Stack: Vite + React 18 + TS, React Router v6,
  TanStack Query v5 (+ localStorage persister), PokeAPI (read-only upstream).

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
