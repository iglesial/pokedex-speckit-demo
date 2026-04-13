# Tasks: Pokémon Catalog

**Input**: Design documents from `/specs/002-pokemon-catalog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: MANDATORY per constitution principle III (Test-First Development, NON-NEGOTIABLE). Every component and hook has a failing test before implementation code is written.

**Organization**: Grouped by user story so each (US1 Browse + Pagination P1, US2 Search P1, US3 Filter P2) can ship independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Paths are repo-root-relative; this is a single-project SPA per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vite + React + TS project and wire shared dev tooling

- [X] T001 Scaffold Vite React-TS project at repo root: `npm create vite@latest . -- --template react-ts` (answer "remove existing files? yes" for non-src files only; preserve `.claude/`, `.packmind/`, `.specify/`, `specs/`)
- [X] T002 Install runtime deps: `npm install react-router-dom @tanstack/react-query @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client`
- [X] T003 Install dev deps: `npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw @types/node`
- [X] T004 [P] Configure Vitest in [vite.config.ts](vite.config.ts) with `test: { environment: 'jsdom', setupFiles: ['src/test/setup.ts'], globals: true }`
- [X] T005 [P] Add npm scripts to [package.json](package.json): `test`, `test:run`, `test:coverage`, `typecheck`, `lint`
- [X] T006 [P] Create [src/test/setup.ts](src/test/setup.ts) importing `@testing-library/jest-dom` and wiring MSW server start/stop hooks
- [X] T007 [P] Create `src/` skeleton directories per plan.md (`components/core`, `pages`, `services`, `hooks`, `contexts`, `types`, `utils`, `config`, `test/handlers`)
- [X] T008 [P] Create empty barrel [src/components/index.ts](src/components/index.ts) to be populated as core components land

**Checkpoint**: `npm run dev` starts Vite; `npm test` runs (0 tests, passes); repo layout matches plan.md.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, routing, PokeAPI client, shared types, MSW fixtures — required by every user story

**⚠️ CRITICAL**: No user story work until this phase is complete.

- [X] T009 [P] Define design tokens in [src/index.css](src/index.css): 18 `--type-*` colors, `--motion-fast`/`--motion-base`/`--motion-slow`, `--shadow-sm`/`--shadow-md`, spacing/radius scales, focus-ring token, `@media (prefers-reduced-motion: reduce)` overrides that zero durations
- [X] T010 [P] Create [src/types/pokemon.ts](src/types/pokemon.ts) exporting `PokemonSummary` and `PokemonType` per data-model.md
- [X] T011 [P] Create [src/config/catalog.ts](src/config/catalog.ts) exporting `PAGE_SIZE = 24`, `GEN1_RANGE`, `TYPE_LIST` (all 18 types)
- [X] T012 [P] Create [src/utils/classNames.ts](src/utils/classNames.ts) — boolean-filtered class array composer per React Core Component Architecture standard
- [X] T013 [P] Write failing test [src/utils/matchPokemon.test.ts](src/utils/matchPokemon.test.ts) covering: empty query, name substring (case-insensitive), exact numeric ID, numeric ID with leading zeros, whitespace-only query, non-matching text
- [X] T014 Implement [src/utils/matchPokemon.ts](src/utils/matchPokemon.ts) until T013 passes
- [X] T015 [P] Create MSW handlers at [src/test/handlers/pokeapi.ts](src/test/handlers/pokeapi.ts) with fixtures for the Gen 1 list endpoint and for specific IDs used in tests (1, 4, 6, 7, 25, 150, 151)
- [X] T016 [P] Write failing tests [src/services/pokeapi.test.ts](src/services/pokeapi.test.ts) for `listGen1Summaries()` (happy path returns 151, per-id fetch populates sprite/types, network error bubbles) and `listTypes()` (filters out `unknown`/`shadow`)
- [X] T017 Implement [src/services/pokeapi.ts](src/services/pokeapi.ts) exporting `listGen1Summaries()` and `listTypes()` until T016 passes; batch per-ID fetches in groups of 10
- [X] T018 Create React Query `QueryClient` + `localStorage`-backed persister in [src/main.tsx](src/main.tsx) with 24h `staleTime`, wrap `<App />` in `QueryClientProvider` and `BrowserRouter`
- [X] T019 Create [src/App.tsx](src/App.tsx) with routes: `/` → `HomePage` (placeholder), `/pokemon/:id` → stub component displaying the ID (detail feature is 003), and a dev-only `/preview` guarded by `import.meta.env.DEV`

**Checkpoint**: `npm test` runs with T013–T017 passing. `npm run dev` renders empty `/` and stub `/pokemon/:id`.

---

## Phase 3: User Story 1 — Browse + Pagination (Priority: P1) 🎯 MVP

**Goal**: User can browse all 151 Gen 1 Pokémon across ~7 pages of 24 cards each, with URL-reflected page state, skeleton placeholders, error recovery, and scroll-position restoration on back-nav.

**Independent Test**: Load `/` → page 1 with 24 cards renders ≤ 2s; click next 6 times to reach page 7 (7 cards, next disabled); click any card → back → same page, same scroll position. Direct URL `/?page=5` lands on page 5 directly.

### Tests (write first, confirm red before implementing)

- [X] T020 [P] [US1] Failing test [src/components/core/TypeBadge/TypeBadge.test.tsx](src/components/core/TypeBadge/TypeBadge.test.tsx) — renders title-cased type name, applies `--type-${type}` color
- [X] T021 [P] [US1] Failing test [src/components/core/SkeletonCard/SkeletonCard.test.tsx](src/components/core/SkeletonCard/SkeletonCard.test.tsx) — renders with pulse class; no animation class under reduced-motion media query
- [X] T022 [P] [US1] Failing test [src/components/core/Card/Card.test.tsx](src/components/core/Card/Card.test.tsx) — renders sprite, title-cased name, `#025`-format ID, 1 or 2 `TypeBadge`s; renders `SkeletonCard` when `loading`; `<a href="/pokemon/25">` for ID 25
- [X] T023 [P] [US1] Failing test [src/components/core/CatalogGrid/CatalogGrid.test.tsx](src/components/core/CatalogGrid/CatalogGrid.test.tsx) — renders children in a grid container
- [X] T024 [P] [US1] Failing test [src/components/core/Pagination/Pagination.test.tsx](src/components/core/Pagination/Pagination.test.tsx) — renders nothing when `totalPages === 1`; disables prev on page 1, next on last; fires `onChange` with target page; elides to `1 2 … 5 6 7` when > 7 pages
- [X] T025 [P] [US1] Failing test [src/components/core/ErrorState/ErrorState.test.tsx](src/components/core/ErrorState/ErrorState.test.tsx) — default message; custom message; invokes `onRetry`
- [X] T026 [P] [US1] Failing test [src/hooks/useCatalogQuery.test.ts](src/hooks/useCatalogQuery.test.ts) — parses `/` → defaults; `?page=3` → `{ page: 3 }`; `?page=abc` → `page: 1`; serialize defaults omits keys; updater with `replace: true` does not add history entry
- [X] T027 [P] [US1] Failing test [src/hooks/useFilteredCatalog.test.ts](src/hooks/useFilteredCatalog.test.ts) — with empty query, returns all 151 / paged; page slice of 24; last page has `151 - 6*24 = 7` items; invariants I1/I2/I5
- [X] T028 [P] [US1] Failing test [src/hooks/useScrollRestore.test.ts](src/hooks/useScrollRestore.test.ts) — captures `scrollY` and focused card id on unmount; restores on next mount with same URL key
- [X] T029 [P] [US1] Failing integration test [src/pages/HomePage/HomePage.test.tsx](src/pages/HomePage/HomePage.test.tsx) with MSW: renders skeletons → 151 cards → 24 on page 1; clicking next goes to page 2 and URL becomes `?page=2`; last page disables next; scroll restoration asserted by mock `sessionStorage`

### Implementation (write code until tests pass)

- [X] T030 [P] [US1] Implement [src/components/core/TypeBadge/](src/components/core/TypeBadge/) (`.tsx`, `.css`) + export from [src/components/index.ts](src/components/index.ts)
- [X] T031 [P] [US1] Implement [src/components/core/SkeletonCard/](src/components/core/SkeletonCard/) with keyframes tied to `--motion-slow`, reduced-motion override
- [X] T032 [P] [US1] Implement [src/components/core/CatalogGrid/](src/components/core/CatalogGrid/) — CSS Grid `repeat(auto-fill, minmax(...))`
- [X] T033 [P] [US1] Implement [src/components/core/ErrorState/](src/components/core/ErrorState/)
- [X] T034 [US1] Implement [src/components/core/Card/](src/components/core/Card/) using `TypeBadge` and `SkeletonCard`, `<a>` element with hover elevation via shadow token swap (depends on T030, T031)
- [X] T035 [P] [US1] Implement [src/components/core/Pagination/](src/components/core/Pagination/) with elision logic and a11y (`<nav aria-label="Catalog pagination">`)
- [X] T036 [P] [US1] Implement [src/hooks/useDebouncedValue.ts](src/hooks/useDebouncedValue.ts) (generic; used by US2 but small and no story coupling)
- [X] T037 [US1] Implement [src/hooks/useCatalogQuery.ts](src/hooks/useCatalogQuery.ts) — URL parse/serialize, updater with replace/push options, page clamping signature
- [X] T038 [US1] Implement [src/hooks/useFilteredCatalog.ts](src/hooks/useFilteredCatalog.ts) — memoized derive of `FilteredCatalog` from summaries + query + `PAGE_SIZE`
- [X] T039 [US1] Implement [src/hooks/useScrollRestore.ts](src/hooks/useScrollRestore.ts) — sessionStorage-keyed-by-URL, restores `scrollY` + focused card id
- [X] T040 [US1] Implement [src/pages/HomePage/HomePage.tsx](src/pages/HomePage/HomePage.tsx) + `.css`: wires `useQuery(listGen1Summaries)` → `useCatalogQuery` → `useFilteredCatalog` → renders `CatalogGrid` of `Card`s (or skeletons during load), `Pagination` below, `ErrorState` on fetch failure, `useScrollRestore` attached
- [X] T041 [US1] Register `HomePage` at `/` in [src/App.tsx](src/App.tsx)
- [X] T042 [US1] Add `/preview` entries for `Card` (default, loading, focused), `TypeBadge` (all 18), `SkeletonCard`, `Pagination` (first/middle/last/single-page/elided), `ErrorState` at [src/pages/PreviewPage/PreviewPage.tsx](src/pages/PreviewPage/PreviewPage.tsx)

**Checkpoint**: US1 independently testable. T029 integration test green. Manual: load `/`, paginate to page 7, click card → back → verify page + scroll restored.

---

## Phase 4: User Story 2 — Search by Name or ID (Priority: P1)

**Goal**: Header search input filters the catalog by partial name (case-insensitive) or exact ID (≤500ms), keyboard-navigable, resets to page 1 of filtered result set, shows specific empty state when zero matches.

**Independent Test**: Focus search, type "char" → 3 cards within 500ms, URL `?q=char`; type "150" → Mewtwo alone; type "zzz" → empty state with "Clear search"; from search press ↓ → focus moves into grid.

### Tests

- [X] T043 [P] [US2] Failing test [src/components/core/SearchInput/SearchInput.test.tsx](src/components/core/SearchInput/SearchInput.test.tsx) — renders labeled input, fires `onChange`, clear (×) button appears when non-empty and fires `onChange("")`, `onArrowDown` fires on ArrowDown keydown
- [X] T044 [P] [US2] Failing test [src/components/core/EmptyState/EmptyState.test.tsx](src/components/core/EmptyState/EmptyState.test.tsx) — renders title/description/action; invokes `onAction`
- [X] T045 [US2] Extend [src/hooks/useCatalogQuery.test.ts](src/hooks/useCatalogQuery.test.ts) — parse `?q=CHAR` → lowercase; whitespace-only query → empty; serialize `q=""` omits key; updating `q` resets `page` to 1
- [X] T046 [US2] Extend [src/hooks/useFilteredCatalog.test.ts](src/hooks/useFilteredCatalog.test.ts) — `q="char"` → 3 results; `q="025"` → Pikachu alone; `q="zzz"` → `isEmpty: true`; all scenarios paginate correctly (3 results fit on 1 page)
- [X] T047 [US2] Extend [src/pages/HomePage/HomePage.test.tsx](src/pages/HomePage/HomePage.test.tsx) — typing "char" updates URL to `?q=char` after 150ms debounce; grid shows 3 cards; clearing restores full grid; zero-match shows `EmptyState` with "Clear search" CTA; ArrowDown from search moves focus to first card

### Implementation

- [X] T048 [P] [US2] Implement [src/components/core/SearchInput/](src/components/core/SearchInput/) + barrel export
- [X] T049 [P] [US2] Implement [src/components/core/EmptyState/](src/components/core/EmptyState/) + barrel export
- [X] T050 [US2] Extend `useCatalogQuery` to handle `q` parse/serialize with trim + page-reset invariant (I3)
- [X] T051 [US2] Extend `useFilteredCatalog` to apply `matchesQuery` (uses `matchPokemon` utility from T014)
- [X] T052 [US2] Wire `SearchInput` into `HomePage`: local state → `useDebouncedValue(150)` → `useCatalogQuery` updater with `replace: true`; render `EmptyState` with "Clear search" CTA when `isEmpty && q !== ""` and no filters; ArrowDown → focus first `Card`
- [X] T053 [US2] Add `SearchInput` + `EmptyState` (search-only variant) entries to `/preview`

**Checkpoint**: US1 + US2 both independently functional. Integration test green. Manual: "char" → 3 cards; "zzz" → empty state with CTA; ↓ from input → focus first card.

---

## Phase 5: User Story 3 — Filter by Type (Priority: P2)

**Goal**: Type-filter chips narrow the grid with AND semantics; combined with search; one-click reset; zero-match combinations show combined empty state.

**Independent Test**: Click "Fire" → 12 cards; add "Flying" → only Charizard; click reset → full 151; `?q=char&types=fire,flying` direct URL → only Charizard page 1.

### Tests

- [X] T054 [P] [US3] Failing test [src/components/core/TypeFilterChip/TypeFilterChip.test.tsx](src/components/core/TypeFilterChip/TypeFilterChip.test.tsx) — renders as `<button aria-pressed={active}>`; click fires `onToggle(type)`; disabled state prevents toggle
- [X] T055 [P] [US3] Failing test [src/components/core/TypeFilterBar/TypeFilterBar.test.tsx](src/components/core/TypeFilterBar/TypeFilterBar.test.tsx) — renders 18 chips; reset button hidden when `active.size === 0`; reset click fires `onChange(new Set())`; chip click adds/removes from set
- [X] T056 [US3] Extend [src/hooks/useCatalogQuery.test.ts](src/hooks/useCatalogQuery.test.ts) — parse `?types=FIRE,FLYING` → lowercase set; unknown values dropped; empty `types` omitted on serialize; updating `types` resets `page` to 1
- [X] T057 [US3] Extend [src/hooks/useFilteredCatalog.test.ts](src/hooks/useFilteredCatalog.test.ts) — `types={fire}` → 12 Gen 1 Fire; `types={fire,flying}` → only Charizard; `types={}` → all; combined with `q` applies intersection
- [X] T058 [US3] Extend [src/pages/HomePage/HomePage.test.tsx](src/pages/HomePage/HomePage.test.tsx) — clicking "Fire" chip updates URL to `?types=fire` and grid to 12 cards; adding "Flying" → 1 card (Charizard); reset button clears URL types param; search + filter empty → combined empty state with "Reset all" CTA

### Implementation

- [X] T059 [P] [US3] Implement [src/components/core/TypeFilterChip/](src/components/core/TypeFilterChip/) using `TypeBadge` internally + barrel export
- [X] T060 [US3] Implement [src/components/core/TypeFilterBar/](src/components/core/TypeFilterBar/) composing 18 chips + reset control (depends on T059)
- [X] T061 [US3] Extend `useCatalogQuery` to handle `types` parse/serialize (csv ↔ `Set<PokemonType>`, unknown filter, page-reset invariant)
- [X] T062 [US3] Extend `useFilteredCatalog` to apply `matchesTypes` in composition with `matchesQuery`
- [X] T063 [US3] Wire `TypeFilterBar` into `HomePage` above `CatalogGrid`; compute empty-state variant based on `(q !== "", types.size > 0)` combinations → render correct copy + CTA per research.md §11
- [X] T064 [US3] Add `TypeFilterChip`, `TypeFilterBar`, `EmptyState` (filter-only and combined variants) entries to `/preview`

**Checkpoint**: All three user stories independently functional. Quickstart walkthrough passes end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T065 [P] Run quickstart.md acceptance-scenario walkthrough in-browser; record any gaps as issues
- [X] T066 [P] Run automated a11y audit (e.g., `@axe-core/react` in dev) on `/` with filters and search active; fix any critical violations (SC-007)
- [X] T067 [P] Keyboard-only walkthrough: reach every Pokémon's detail page via Tab + Arrow + Enter only (SC-006)
- [X] T068 [P] Verify motion budget — all transitions ≤ 250ms; `prefers-reduced-motion` zeroes animations (constitution VI)
- [X] T069 [P] Performance: confirm first page ≤ 2s on cold cache (SC-001); filter + page change ≤ 250ms on warm cache (SC-004/SC-005a) via DevTools Performance tab
- [X] T070 Review bundle size and lazy-load the `/preview` route so it does not ship in production bundle
- [X] T071 Update [CLAUDE.md](CLAUDE.md) / agent context with any new patterns discovered during implementation
- [X] T072 Verify `/preview` renders every variant listed in quickstart.md §"Visual review on /preview"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → no dependencies
- **Phase 2 (Foundational)** → depends on Phase 1; **blocks all user stories**
- **Phase 3 (US1 Browse+Pagination)** → depends on Phase 2 — MVP
- **Phase 4 (US2 Search)** → depends on Phase 2; can run in parallel with Phase 3 by a second developer, but Phase 3 delivers the viable baseline
- **Phase 5 (US3 Filter)** → depends on Phase 2; can run parallel with 3 and 4
- **Phase 6 (Polish)** → depends on whichever user stories are targeted for this release

### Within each story

- Write failing tests → implement → verify green
- Models/utilities before services before components before pages
- No cross-story dependencies (each story's integration test runs in isolation)

### Parallel Opportunities

- **Phase 1**: T004, T005, T006, T007, T008 all `[P]`
- **Phase 2**: T009, T010, T011, T012, T013, T015, T016 all `[P]`; T014 after T013; T017 after T016; T018 after T017; T019 after T018
- **Phase 3**: T020–T029 (all tests) in parallel; T030–T033, T035, T036 in parallel; T034 after T030+T031; T037/T038/T039 after T026/T027/T028; T040 after T030–T039; T041 after T040; T042 after T040
- **Phase 4**: T043, T044 in parallel; T048, T049 in parallel; T050 after T045; T051 after T046; T052 after T048/T049/T050/T051; T053 after T052
- **Phase 5**: T054, T055 in parallel; T059 in parallel with tests; T060 after T059; T061 after T056; T062 after T057; T063 after T060/T061/T062; T064 after T063

---

## Parallel Example: User Story 1 tests

```text
# Run all US1 test-authoring tasks in parallel (different files):
Task: "T020 Failing test for TypeBadge"
Task: "T021 Failing test for SkeletonCard"
Task: "T022 Failing test for Card"
Task: "T023 Failing test for CatalogGrid"
Task: "T024 Failing test for Pagination"
Task: "T025 Failing test for ErrorState"
Task: "T026 Failing test for useCatalogQuery"
Task: "T027 Failing test for useFilteredCatalog"
Task: "T028 Failing test for useScrollRestore"
Task: "T029 Failing integration test for HomePage"
```

---

## Implementation Strategy

### MVP (ship US1 only)

1. Phase 1 → Phase 2 → Phase 3 → validate via T029 integration test + manual walkthrough → ship.

### Incremental Delivery

1. Phase 1 + 2 → foundation.
2. Phase 3 (US1) → test → deploy (MVP: user can browse 151 Pokémon with pagination).
3. Phase 4 (US2) → test → deploy (users can now search).
4. Phase 5 (US3) → test → deploy (type filters unlock exploration).
5. Phase 6 polishes the whole.

### Parallel team strategy

Once Phase 2 is done, assign one developer per user story phase. Each phase's test suite covers its slice; the `HomePage.test.tsx` integration test grows as stories land but never breaks across boundaries.

---

## Notes

- `[P]` tasks touch different files and have no dependencies on incomplete tasks in the same batch.
- Constitution III (Test-First) is enforced: every implementation task has a corresponding failing test task earlier in the phase. Do not skip.
- Every new core component must get a `/preview` entry in the same phase that introduces it.
- Commit after each logical group (e.g., after each passing phase checkpoint) per spec-driven delivery practice.
