# Tasks: Pokémon Detail Page

**Input**: Design documents from `/specs/006-pokemon-detail/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: MANDATORY per constitution principle III. Every component, hook, utility, and service function has a failing test before implementation.

**Organization**: Grouped by user story so each (US1 View Profile P1, US2 Return to Catalog P1, US3 Errors + Not-Found P2) can ship independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Paths are repo-root-relative; single-project SPA per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies. Just extend shared config + MSW fixtures + index.css tokens.

- [X] T001 [P] Add stat-band CSS tokens (`--stat-low`, `--stat-mid`, `--stat-high`, `--stat-track`) to [src/index.css](src/index.css)
- [X] T002 [P] Add `STAT_MAX = 255` and `STAT_BANDS = { low: 50, mid: 100 }` exports to [src/config/catalog.ts](src/config/catalog.ts)
- [X] T003 [P] Extend [src/types/pokemon.ts](src/types/pokemon.ts) with `BaseStats`, `PokemonAbility`, and `PokemonDetail` interfaces per data-model.md

**Checkpoint**: `npm run typecheck` clean; tokens defined.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utility functions, MSW fixtures, and the PokeAPI service extension that every user story needs.

**⚠️ CRITICAL**: No user story work until this phase is complete.

### Utilities (test-first)

- [X] T004 [P] Failing test [src/utils/normalizeFlavor.test.ts](src/utils/normalizeFlavor.test.ts) — strips `\f`, `\u00A0`, `\u00AD`, normalizes `\n` to space, collapses consecutive whitespace, preserves single spaces
- [X] T005 Implement [src/utils/normalizeFlavor.ts](src/utils/normalizeFlavor.ts) until T004 passes
- [X] T006 [P] Failing test [src/utils/formatMeasurements.test.ts](src/utils/formatMeasurements.test.ts) — `formatHeight(7)` → `"0.7 m"`, `formatHeight(17)` → `"1.7 m"`; `formatWeight(905)` → `"90.5 kg"`, `formatWeight(1)` → `"0.1 kg"`
- [X] T007 Implement [src/utils/formatMeasurements.ts](src/utils/formatMeasurements.ts) until T006 passes
- [X] T008 [P] Failing test [src/utils/formatStat.test.ts](src/utils/formatStat.test.ts) — `statLabel('specialAttack')` → `"Sp. Atk"`; `statBand(49)` → `"low"`, `statBand(50)` → `"mid"`, `statBand(100)` → `"high"`, `statBand(255)` → `"high"`
- [X] T009 Implement [src/utils/formatStat.ts](src/utils/formatStat.ts) until T008 passes

### Service + MSW

- [X] T010 [P] Extend MSW handlers at [src/test/handlers/pokeapi.ts](src/test/handlers/pokeapi.ts) with `/pokemon-species/:id` fixtures for IDs 1, 6, 25, 150 (include English + non-English flavor entries, plus one fixture with NO English entry to exercise the null path)
- [X] T011 [P] Extend pokemon fixtures in same file with `stats[]`, `height`, `weight`, `abilities[]` (including `is_hidden: true` for at least one)
- [X] T012 Failing tests for `getPokemonDetail()` in [src/services/pokeapi.test.ts](src/services/pokeapi.test.ts) — happy path maps to `PokemonDetail`; out-of-range id rejects with `PokemonNotFoundError` with no network; upstream 404 rejects with `PokemonNotFoundError`; flavor text normalization applied; no-English-entry → `flavorText: null`
- [X] T013 Implement `getPokemonDetail(id)` and export `PokemonNotFoundError` from [src/services/pokeapi.ts](src/services/pokeapi.ts) until T012 passes; parallel fetch `/pokemon/{id}` + `/pokemon-species/{id}` via `Promise.all`; cache key `['pokemon-detail', id]` documented via JSDoc

**Checkpoint**: all utilities and service tests green.

---

## Phase 3: User Story 1 — View a Pokémon's Profile (Priority: P1) 🎯 MVP

**Goal**: `/pokemon/:id` renders the full profile for any Gen 1 Pokémon — artwork with entry motion, name, ID, types, stat bars, height/weight, abilities (hidden flagged), flavor text. Skeleton covers loading.

**Independent Test**: Open `/pokemon/6` → within ~2s see Charizard artwork, `#006`, Fire + Flying badges, 6 stat bars, `1.7 m` / `90.5 kg`, Blaze (regular) + Solar Power (Hidden), English flavor text. `/pokemon/006` resolves identically.

### Tests (red → green)

- [X] T014 [P] [US1] Failing test [src/components/core/StatBar/StatBar.test.tsx](src/components/core/StatBar/StatBar.test.tsx) — width at values 0 / 50 / 100 / 150 / 255 / 300 (clamped); correct `data-band` low/mid/high; `aria-label` format `"<label> <value> out of <max>"`
- [X] T015 [P] [US1] Failing test [src/components/core/AbilityList/AbilityList.test.tsx](src/components/core/AbilityList/AbilityList.test.tsx) — renders regular abilities; renders hidden abilities with "Hidden" label and after regular; omits hidden label when zero hidden abilities
- [X] T016 [P] [US1] Failing test [src/components/core/DetailHero/DetailHero.test.tsx](src/components/core/DetailHero/DetailHero.test.tsx) — renders artwork `<img>` with fallback when `artworkUrl` is null; renders title-cased name in `<h1>`; `#NNN` id; 1 or 2 type badges; height + weight via formatMeasurements
- [X] T017 [P] [US1] Failing test [src/components/core/SkeletonDetail/SkeletonDetail.test.tsx](src/components/core/SkeletonDetail/SkeletonDetail.test.tsx) — renders with `aria-busy="true"`; visually-hidden "Loading Pokémon details" status text present
- [X] T018 [US1] Failing integration test for the loaded state in [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) — `/pokemon/6` + `/pokemon/006` both render Charizard's artwork, #006, types, 6 stat bars, abilities (hidden flagged), flavor text; skeleton visible before MSW resolves; no-English-flavor fixture omits flavor block

### Implementation

- [X] T019 [P] [US1] Implement [src/components/core/StatBar/](src/components/core/StatBar/) (`.tsx`, `.css`) — width formula, data-band, tokenized fill color per band; barrel export
- [X] T020 [P] [US1] Implement [src/components/core/AbilityList/](src/components/core/AbilityList/) — group regular before hidden; "Hidden" label styling; barrel export
- [X] T021 [P] [US1] Implement [src/components/core/SkeletonDetail/](src/components/core/SkeletonDetail/) — full-page layout matching loaded shape; `aria-busy` wrapper + SR text; barrel export
- [X] T022 [US1] Implement [src/components/core/DetailHero/](src/components/core/DetailHero/) — composes `TypeBadge` + stats fields layout + artwork `<img>` with `heroReveal` CSS keyframe (scale 0.92→1, opacity 0→1, duration `--motion-slow`, reduced-motion override); barrel export (depends on T019 only for shared token imports)
- [X] T023 [US1] Implement [src/pages/DetailPage/DetailPage.tsx](src/pages/DetailPage/DetailPage.tsx) + `.css` — read `:id` via `useParams`, short-circuit to not-found for invalid id (but keep stub for now; wired in US3), otherwise `useQuery(['pokemon-detail', id], getPokemonDetail)`; render `SkeletonDetail` on pending, compose `DetailHero` + stat-bar grid + `AbilityList` + flavor paragraph on loaded
- [X] T024 [US1] Replace the import of the stub `DetailPage` in [src/App.tsx](src/App.tsx) with the real implementation (route path `/pokemon/:id` already exists)
- [X] T025 [US1] Add `/preview` entries for `StatBar` (low/mid/high/clamped/zero), `AbilityList` (regular+hidden / regular-only / all-hidden), `DetailHero` (1-type / 2-types / artwork-null), `SkeletonDetail` in [src/pages/PreviewPage/PreviewPage.tsx](src/pages/PreviewPage/PreviewPage.tsx)

**Checkpoint**: US1 independently testable. T018 green. Manual: visit `/pokemon/6` in browser — everything renders with entry motion.

---

## Phase 4: User Story 2 — Return to Catalog Where I Left Off (Priority: P1)

**Goal**: Visible BackButton on detail page returns user to catalog at same page, scroll, search, and filter state. Works via click, Enter, Space, and browser back button.

**Independent Test**: From `/?q=char&types=fire&page=2`, click any card → detail page → click "Back to catalog" → land back at `/?q=char&types=fire&page=2` scrolled to the card.

### Tests

- [X] T026 [P] [US2] Failing test [src/components/core/BackButton/BackButton.test.tsx](src/components/core/BackButton/BackButton.test.tsx) — when `history.state.idx > 0`, click calls `navigate(-1)`; when idx is 0/undefined, click navigates to `'/'` (or `fallbackTo`); keyboard Enter + Space both fire; has accessible name matching `label` prop
- [X] T027 [US2] Extend [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) with a back-nav integration test — enter detail from catalog URL `?q=char&page=2`, render DetailPage, click back button, assert `navigate(-1)` effect (catalog URL restored via MemoryRouter's `initialEntries` containing both URLs)

### Implementation

- [X] T028 [P] [US2] Implement [src/components/core/BackButton/](src/components/core/BackButton/) (`.tsx`, `.css`) — history-aware navigate; chevron + label; focus-visible; barrel export
- [X] T029 [US2] Wire `<BackButton>` into [src/pages/DetailPage/DetailPage.tsx](src/pages/DetailPage/DetailPage.tsx) at the top of the layout (visible in all 4 states: loading, loaded, error, not-found)
- [X] T030 [US2] Add `BackButton` entry (default + custom label) to [src/pages/PreviewPage/PreviewPage.tsx](src/pages/PreviewPage/PreviewPage.tsx)

**Checkpoint**: US1 + US2 both work. Manual: from catalog with active search/filter + page, click card → detail → back → original catalog state restored (scroll/focus already handled by existing `useScrollRestore`).

---

## Phase 5: User Story 3 — Not-Found and Error Handling (Priority: P2)

**Goal**: Malformed URLs, out-of-range IDs, and upstream failures render friendly, actionable states — not a blank screen.

**Independent Test**: `/pokemon/abc` → NotFoundState with catalog link (no network). `/pokemon/999` → NotFoundState. Simulate 500 on `/pokemon/25` → ErrorState with Retry; retry succeeds.

### Tests

- [X] T031 [P] [US3] Failing test [src/components/core/NotFoundState/NotFoundState.test.tsx](src/components/core/NotFoundState/NotFoundState.test.tsx) — default renders generic "No Pokémon found" heading; with `id` prop renders "No Pokémon with ID {id}"; contains a `<Link to="/">` with "Back to catalog" text; `role="status"`
- [X] T032 [US3] Extend [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) — `/pokemon/abc` renders NotFoundState without firing a network request (assert via MSW request counter or spy); `/pokemon/999` renders NotFoundState; MSW 404 on `/pokemon/25` renders NotFoundState; MSW 500 on `/pokemon/25` renders ErrorState with Retry; clicking Retry refetches and renders loaded state

### Implementation

- [X] T033 [P] [US3] Implement [src/components/core/NotFoundState/](src/components/core/NotFoundState/) (`.tsx`, `.css`) — `role="status"`, glyph, heading, `<Link to="/">Back to catalog</Link>`; barrel export
- [X] T034 [US3] Extend [src/pages/DetailPage/DetailPage.tsx](src/pages/DetailPage/DetailPage.tsx) with the discriminated-union state machine from data-model.md §Detail Page State — short-circuit to NotFoundState for invalid/out-of-range id without firing a query; map `PokemonNotFoundError` from query to NotFoundState; map other errors to `<ErrorState onRetry={() => refetch()} />`
- [X] T035 [US3] Add `NotFoundState` entries (default / with id) to [src/pages/PreviewPage/PreviewPage.tsx](src/pages/PreviewPage/PreviewPage.tsx)

**Checkpoint**: All three user stories independently functional. All acceptance scenarios from spec.md walk green in the browser.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T036 [P] Add a11y smoke test [src/pages/DetailPage/DetailPage.a11y.test.tsx](src/pages/DetailPage/DetailPage.a11y.test.tsx) — renders loaded state, runs `jest-axe` with `color-contrast` disabled; asserts zero violations (SC-006)
- [X] T037 [P] Walk quickstart.md acceptance-scenario table in-browser; record any gaps as issues
- [X] T038 [P] Keyboard-only walkthrough: reach DetailPage from catalog, activate BackButton, reach Retry button in error state — all via Tab + Enter/Space only
- [X] T039 [P] Verify hero entry motion stays within `--motion-slow` (400ms); confirm `prefers-reduced-motion` zeroes it (OS toggle in DevTools)
- [X] T040 [P] Measure: detail page TTI for `/pokemon/6` cold cache ≤ 2s on broadband (SC-001); NotFoundState renders ≤ 1s for invalid URLs (SC-004)
- [X] T041 Update [CLAUDE.md](CLAUDE.md) "Recent Changes" with feature 006 summary
- [X] T042 Verify `/preview` renders every variant listed in quickstart.md §"Visual review on /preview"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → no deps.
- **Phase 2 (Foundational)** → depends on Phase 1; blocks all user stories.
- **Phase 3 (US1 View Profile)** → depends on Phase 2 — MVP.
- **Phase 4 (US2 Back Nav)** → depends on Phase 3 (needs DetailPage to host BackButton).
- **Phase 5 (US3 Errors + Not-Found)** → depends on Phase 3 (extends DetailPage state machine).
- **Phase 6 (Polish)** → depends on whichever user stories are shipping.

### Within each story

- Tests first (red) → implementation until green.
- Utilities/services before components before pages.

### Parallel opportunities

- **Phase 1**: T001, T002, T003 all `[P]`.
- **Phase 2**: T004, T006, T008, T010, T011 in parallel; T005 after T004; T007 after T006; T009 after T008; T012 after T010+T011; T013 after T012.
- **Phase 3**: T014–T018 all in parallel (tests); T019, T020, T021 in parallel (independent); T022 after T019 (shares tokens but not files); T023 after T019–T022; T024 after T023; T025 after T019–T022.
- **Phase 4**: T026 parallel with T028; T027 after T028; T029 after T028; T030 after T028.
- **Phase 5**: T031 parallel with T033; T032 after T033 + T034; T034 after T033; T035 after T033.
- **Phase 6**: all `[P]` except T041 (sequential with whatever lands).

---

## Parallel Example: Phase 3 tests

```text
# All US1 test-authoring tasks in parallel (different files):
Task: "T014 Failing test for StatBar"
Task: "T015 Failing test for AbilityList"
Task: "T016 Failing test for DetailHero"
Task: "T017 Failing test for SkeletonDetail"
Task: "T018 Failing integration test for DetailPage (loaded state)"
```

---

## Implementation Strategy

### MVP (ship US1 only)

1. Phase 1 → Phase 2 → Phase 3 → validate T018 + manual walkthrough → ship.
   - Caveat: without US2 (BackButton) you still have the browser back button, so the catalog is reachable. Without US3, invalid URLs show a raw loading/error state. Prefer shipping all three P1/P2 stories together unless a release window forces a cut.

### Incremental Delivery

1. Phase 1 + 2 → foundation.
2. Phase 3 (US1) → test → demo the profile page.
3. Phase 4 (US2) → test → demo back-nav restoration.
4. Phase 5 (US3) → test → demo resilient error/not-found.
5. Phase 6 polish.

### Parallel team strategy

After Phase 2 done:
- Dev A: Phase 3 (US1)
- Dev B: starts Phase 4 (US2) after DetailPage stub from T023 is merged; can scaffold BackButton + tests in parallel
- Dev C: Phase 5 (US3) follows the same pattern

---

## Notes

- `[P]` tasks touch different files and have no dependencies on incomplete tasks in the same batch.
- Constitution principle III (Test-First) is enforced: every implementation task has a corresponding failing test earlier in the same phase. Do not skip.
- Every new core component must get a `/preview` entry in the same phase it's introduced.
- The feature 002 catalog's `useScrollRestore` already handles page-and-scroll restoration on back-nav — no duplication needed here.
