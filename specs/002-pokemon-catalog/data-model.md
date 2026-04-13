# Data Model: Pokémon Catalog

**Feature**: 002-pokemon-catalog
**Date**: 2026-04-12

Purely client-side view-models. No server-side persistence. URL is the source of truth for user intent; React Query is the source of truth for fetched data.

## Core Types

### `PokemonSummary`

Lightweight projection of PokeAPI data used for grid rendering and filtering.

```ts
interface PokemonSummary {
  id: number;             // 1..151
  name: string;           // lowercase kebab from API, e.g. "pikachu"
  types: PokemonType[];   // 1 or 2 elements, in API order
  spriteUrl: string | null; // official-artwork default; null until hydrated
}
```

**Validation rules**:
- `id` must be in `[1, 151]`; out-of-range entries filtered before use.
- `types.length` is 1 or 2.
- `spriteUrl` may be transiently `null` while the per-Pokémon fetch is pending; cards render skeleton art in that state.

### `PokemonType`

```ts
type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';
```

Full 18-type enum kept for filter UI consistency even though Gen 1 uses a subset (no dark/steel/fairy).

## URL-Resident State

### `CatalogQuery`

```ts
interface CatalogQuery {
  q: string;                 // trimmed search query; "" when absent
  types: Set<PokemonType>;   // may be empty
  page: number;              // 1-based, defaults to 1
}
```

**Serialization** (URL ↔ object):
- URL `?q=char&types=fire,flying&page=2` ↔ `{ q: "char", types: new Set(["fire","flying"]), page: 2 }`.
- Absent keys map to defaults: `{ q: "", types: new Set(), page: 1 }`.
- Keys with empty values are omitted on write (canonical URL form).

**Validation rules** (applied in `useCatalogQuery`):
- `q` is trimmed; a whitespace-only query is treated as empty.
- `types` values coerced to lowercase; unknown strings dropped.
- `page` coerced to integer; `NaN` or `<1` clamped to `1`; values above `totalPages` of the filtered set clamped to `totalPages` (FR-005e).

### `FilteredCatalog` (derived)

```ts
interface FilteredCatalog {
  all: PokemonSummary[];       // full filtered set (after q + types)
  page: PokemonSummary[];      // slice for current page
  totalPages: number;          // ceil(all.length / PAGE_SIZE), min 1
  pageIndex: number;           // 0-based for internal use
  isEmpty: boolean;            // all.length === 0
}
```

Derived by `useFilteredCatalog(query)`. Pure function of the summary list + `CatalogQuery` + `PAGE_SIZE`.

### `PageViewAnchor` (session-local)

Not a persistent entity; captured in `sessionStorage` keyed by URL.

```ts
interface PageViewAnchor {
  scrollY: number;       // pixel offset at the time of leaving
  focusCardId: number | null; // the Pokémon ID of the last-focused card
}
```

Restored by `useScrollRestore()` on catalog mount when the URL matches.

## Filter Logic

### Name / ID search

```ts
function matchesQuery(summary: PokemonSummary, q: string): boolean {
  if (q === '') return true;
  if (/^\d+$/.test(q)) {
    return summary.id === parseInt(q, 10);   // numeric → exact ID
  }
  return summary.name.includes(q.toLowerCase()); // text → substring
}
```

### Type AND intersection

```ts
function matchesTypes(summary: PokemonSummary, types: Set<PokemonType>): boolean {
  if (types.size === 0) return true;
  for (const t of types) if (!summary.types.includes(t)) return false;
  return true;
}
```

### Composition

```ts
filtered = all.filter(s =>
  matchesQuery(s, query.q) && matchesTypes(s, query.types)
);
```

## Invariants

- **I1**: `CatalogQuery.page` is always clamped to `[1, totalPages]` before rendering.
- **I2**: The grid renders exactly `min(PAGE_SIZE, all.length - (page-1)*PAGE_SIZE)` cards.
- **I3**: Changing `q` or `types` resets `page` to 1 (FR-005d).
- **I4**: `isEmpty` implies the empty-state component is rendered, not a zero-card grid.
- **I5**: Cards render in ascending `id` order within and across pages.

## State Transitions

```
URL → useCatalogQuery → CatalogQuery
                             │
                             ▼
summaries + CatalogQuery → useFilteredCatalog → FilteredCatalog
                                                      │
                                                      ▼
                                              HomePage renders grid or empty state
```

User actions:
- Type in search → debounced 150ms → `navigate({ q: newQ, page: 1, types }, { replace: true })`.
- Click type chip → toggle in `types` → `navigate({ q, page: 1, types: newTypes }, { replace: true })`.
- Click pagination → `navigate({ q, types, page: newPage }, { push: true })`.
- Click "reset filters" → `navigate({ page: 1 }, { replace: true })`.

## Constants

```ts
const PAGE_SIZE = 24;
const GEN1_RANGE = { min: 1, max: 151 } as const;
const TYPE_LIST: PokemonType[] = [
  'normal','fire','water','electric','grass','ice',
  'fighting','poison','ground','flying','psychic','bug',
  'rock','ghost','dragon','dark','steel','fairy',
];
```
