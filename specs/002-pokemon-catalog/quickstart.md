# Quickstart: Pokémon Catalog

**Feature**: 002-pokemon-catalog

Assumes the project has been scaffolded per the parent scope's quickstart and dependencies are installed.

## Run

```bash
npm run dev
# open http://localhost:5173/           → catalog page 1
# open http://localhost:5173/preview    → component gallery (dev-only)
```

## Walk the acceptance scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| US1.1 — first render | Load `/` on a cold cache | Page 1 of 24 cards within ~2s; skeletons during load |
| US1.3 — paginate | Click "next" repeatedly | URL updates to `?page=N`; cards advance through all 151 across 7 pages |
| US1.5 — return from detail | Open any card → back | Same page, scrolled to that card, focus restored |
| US1.6 — direct URL | Open `/?page=5` directly | Page 5 renders; no bounce through page 1 |
| US2.1 — name search | Type "char" | Within 500ms, 3 cards (Charmander/Charmeleon/Charizard); URL = `?q=char` |
| US2.2 — ID search | Type "150" | Mewtwo appears alone |
| US2.4 — keyboard | Focus search, type "pika", press ↓ | Focus lands on Pikachu card; Enter opens detail |
| US3.1 — single filter | Click "Fire" chip | 12 Gen 1 Fire-type Pokémon (Charmander family, Vulpix, Growlithe, etc.) |
| US3.2 — AND filter | Add "Flying" chip | Only Charizard |
| US3.3 — reset | Click "Reset filters" | Full 151 roster, page 1 |
| Edge — page out of range | `/?page=99` | Clamps to last valid page |
| Edge — unknown type param | `/?types=unknown` | Treated as no filter |
| Edge — search + filter empty | `/?q=zzz&types=fire` | Combined empty state, "Reset all" CTA |

## Run tests

```bash
npm test            # Vitest watch
npm run test:run    # CI mode
```

Required coverage before merge:
- Every component in `contracts/catalog-components.md` has a colocated test.
- `useCatalogQuery`, `useFilteredCatalog`, `useDebouncedValue`, `useScrollRestore` have hook tests.
- `HomePage.test.tsx` integration test exercises the full flow in the quickstart table.

## Visual review on `/preview`

Add entries for every new component with all variant combinations:
- `Card`: default, loading, focused.
- `TypeBadge`: all 18 types.
- `SkeletonCard`: static (reduced-motion) and animated.
- `SearchInput`: empty, with query, keyboard-focused.
- `TypeFilterChip`: inactive, active, disabled.
- `TypeFilterBar`: zero active, one active, many active (with reset visible).
- `Pagination`: first page (prev disabled), middle page, last page (next disabled), single-page (renders nothing), elided (>7 pages).
- `CatalogGrid`: desktop 6-col, tablet 3-col, mobile 1-col.
- `EmptyState`: search-only, filter-only, combined.
- `ErrorState`: default.

## Where things live

- Spec: [spec.md](./spec.md)
- Plan: [plan.md](./plan.md)
- Research: [research.md](./research.md)
- Data model: [data-model.md](./data-model.md)
- Contracts: [contracts/](./contracts/)
- Parent scope: [../001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)
- Constitution: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
