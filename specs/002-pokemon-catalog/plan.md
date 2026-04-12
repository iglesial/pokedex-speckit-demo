# Implementation Plan: Pokémon Catalog

**Branch**: `002-pokemon-catalog` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from [specs/002-pokemon-catalog/spec.md](./spec.md)
**Parent Scope**: [specs/001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)

## Summary

The catalog is the home page of the Pokedex SPA. It renders a responsive grid of Gen 1 Pokémon cards with prev/next/jump pagination (default 24/page, ≈7 pages), a header search input (name substring + National Dex ID, ≤500ms, keyboard-navigable), and type-filter chips (AND semantics, one-click reset). Page, query, and filters live in the URL so the view is shareable; page + scroll are restored when returning from a detail page. Data comes from PokeAPI via a shared client module; skeletons, empty states, and error states cover every load and zero-result path.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x
**Primary Dependencies**: Vite, React Router v6 (routing + URL-based state for `?page`, `?q`, `?types`), TanStack Query v5 (PokeAPI fetch + cache)
**Storage**: PokeAPI upstream (read-only); no per-user persistence required for this feature. Catalog state is URL-resident.
**Testing**: Vitest + React Testing Library (colocated `<Component>.test.tsx`), MSW for PokeAPI mocking
**Target Platform**: Evergreen browsers, responsive desktop + mobile web
**Project Type**: Single-project SPA (frontend only)
**Performance Goals**: First page render ≤ 2s (SC-001); search update ≤ 500ms (SC-002); filter/page change ≤ 250ms warm cache (SC-004/SC-005a)
**Constraints**: Inherited from parent CC-001..007 (performance, motion ≤250ms, WCAG 2.1 AA, resilience with skeletons + retry, polish reviewed via `/preview`, React Core Component Architecture compliance, PokeAPI client is the only data gateway)
**Scale/Scope**: 151 Pokémon, ~7 pages, single-user, single catalog page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-Driven Architecture | ✅ PASS | Catalog composed from core components: `Card`, `TypeBadge`, `SkeletonCard`, `SearchInput`, `TypeFilterChip`, `TypeFilterBar`, `Pagination`, `CatalogGrid`, `EmptyState`, `ErrorState`. Page-level composition lives in `src/pages/HomePage/`. |
| II. Design Tokens Over Hard-Coded Values | ✅ PASS | Type colors sourced from tokenized `--type-*` custom properties; spacing/radii/shadow from shared tokens in `src/index.css`. |
| III. Test-First Development | ✅ PASS | Test-first order enforced in `/speckit-tasks`: component and hook tests fail before impl. Integration test for URL ↔ state round-trip. |
| IV. Spec-Driven Delivery | ✅ PASS | Pipeline: constitution v1.1.0 → parent scope 001 → this spec 002 → this plan → tasks → implement. |
| V. Standards Conformance | ✅ PASS | Layout under `src/{components,pages,services,hooks,contexts,types,utils,config,test}/`; barrel export from `src/components/index.ts`; Vitest+RTL; `/preview` entries for each new component. |
| VI. Modern Visual Polish | ✅ PASS | Skeleton fade-ins, card hover elevation, chip press micro-interactions (all ≤250ms, reduced-motion aware). Polish reviewed on `/preview`. |

**Result**: All gates pass. No complexity justifications needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-pokemon-catalog/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── catalog-url.md
│   └── catalog-components.md
├── checklists/
│   └── requirements.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── index.ts
│   └── core/
│       ├── Card/
│       ├── TypeBadge/
│       ├── SkeletonCard/
│       ├── SearchInput/
│       ├── TypeFilterChip/
│       ├── TypeFilterBar/
│       ├── Pagination/
│       ├── CatalogGrid/
│       ├── EmptyState/
│       └── ErrorState/
├── pages/
│   └── HomePage/
│       ├── HomePage.tsx
│       ├── HomePage.css
│       └── HomePage.test.tsx
├── services/
│   └── pokeapi.ts                  # listGen1Summaries(), listTypes()
├── hooks/
│   ├── useCatalogQuery.ts
│   ├── useDebouncedValue.ts
│   ├── useFilteredCatalog.ts
│   └── useScrollRestore.ts
├── types/
│   └── pokemon.ts
├── utils/
│   ├── classNames.ts
│   └── matchPokemon.ts
├── config/
│   └── catalog.ts                  # PAGE_SIZE=24, GEN1_RANGE, TYPE_LIST
├── test/
│   ├── setup.ts
│   └── handlers/pokeapi.ts         # MSW fixtures
├── App.tsx
├── main.tsx
└── index.css                       # tokens (type palette + motion + spacing + shadow)
```

**Structure Decision**: Single-project SPA. Catalog is one page (`HomePage`) assembled from core components. URL is the single source of truth for user intent — no page-level state is duplicated in React state. The PokeAPI client in `services/pokeapi.ts` is the only data gateway (CC-007).

## Complexity Tracking

No constitution violations. Table intentionally empty.
