# Tasks: Evolution Chain

**Input**: Design documents from `/specs/007-evolution-chain/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: MANDATORY per constitution principle III. Every utility, service function, and component has a failing test before implementation.

**Organization**: Grouped by user story so each (US1 Linear Chain P1, US2 Navigation P1, US3 No-Evolutions P2, US4 Branching P2, US5 Scoped Error P3) can be landed and validated independently.

**Assumption**: Feature 006 (detail page) is merged to `main` before Phase 3 starts. The Evolution section hangs off `DetailPage`.

**Cross-feature risk**: T008 mutates the shape of `getPokemonDetail` (adds `evolutionChainId`). If feature 006 has not merged by the time Phase 2 begins, resolve before proceeding:
- Rebase this branch onto `main` *after* PR #6 is merged, or
- Cherry-pick feature 006's `getPokemonDetail` + `PokemonDetail` type onto this branch first.
Feature 006's existing tests (`src/services/pokeapi.test.ts`) assert the full `PokemonDetail` shape — T007/T008 (the Phase 2 service tests here) MUST extend those assertions rather than replace them, so 006 coverage is preserved.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4, US5)
- Paths are repo-root-relative; single-project SPA per plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies. Just add types and extend MSW fixtures. No tokens added (plan explicitly says none).

- [X] T001 [P] Extend [src/types/pokemon.ts](src/types/pokemon.ts) with `EvolutionStage`, `EvolutionEdge`, `EvolutionChain`, and `EvolutionSectionState` interfaces per data-model.md; also add `evolutionChainId: number` to `PokemonDetail`
- [X] T002 [P] Extend [src/test/handlers/pokeapi.ts](src/test/handlers/pokeapi.ts) to: (a) include `evolution_chain: { url: '${POKEAPI_BASE}/evolution-chain/:chainId/' }` on species responses; (b) add a new `/evolution-chain/:id` handler with fixtures covering linear 3-stage (Bulbasaur chain #1), linear 2-stage post-Gen-1-truncation (Pikachu chain with Pichu as pre-evolution, #10), branching (Eevee chain #67), and no-evolutions (Tauros chain #59, Mew chain #78)

**Checkpoint**: `npm run typecheck` clean; MSW handlers return the new endpoints.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure utilities and the new service function. Everything stories depend on.

**⚠️ CRITICAL**: No user story work until this phase is complete.

### Utilities (test-first)

- [X] T003 [P] Failing tests [src/utils/formatEvolutionTrigger.test.ts](src/utils/formatEvolutionTrigger.test.ts) — level-up + min_level → `{short:"Lv. 16", accessible:"evolves at level 16"}`; use-item Fire Stone → `{short:"Fire Stone", accessible:"evolves when given Fire Stone"}`; trade → `{short:"Trade", accessible:"evolves when traded"}`; level-up + min_happiness → `{short:"Friendship", accessible:"evolves with high friendship"}`; empty array → null; unknown trigger → null
- [X] T004 Implement [src/utils/formatEvolutionTrigger.ts](src/utils/formatEvolutionTrigger.ts) until T003 passes
- [X] T005 [P] Failing tests [src/utils/parseEvolutionChain.test.ts](src/utils/parseEvolutionChain.test.ts) — linear 3-stage (Bulbasaur) → 3 stages / 2 edges / `!isBranching` / `!hasNoEvolutions`; Pikachu-with-Pichu-pre-evo input → 2 stages after filter / 1 edge / Pikachu as root; branching Eevee → 4 stages / 3 edges / `isBranching`; Tauros → 1 stage / 0 edges / `hasNoEvolutions === true`; isCurrent set on exactly one stage matching `currentPokemonId`
- [X] T006 Implement [src/utils/parseEvolutionChain.ts](src/utils/parseEvolutionChain.ts) until T005 passes; must depth-first walk the tree in source order, filter Gen 1 via `GEN1_RANGE`, drop incident edges, never synthesize reconnection edges, compute `hasNoEvolutions` from RAW input per research §5

### Service

- [X] T007 [P] Failing tests in [src/services/pokeapi.test.ts](src/services/pokeapi.test.ts) for `getEvolutionChain` — happy path (linear) returns full `EvolutionChain` with sprites hydrated; Eevee returns branching chain with 4 stages; chain endpoint 500 throws `PokeApiError`; per-stage sprite fetch failure leaves that stage's `spriteUrl: null` without failing the call; `evolutionChainId` is present on `PokemonDetail` returned by `getPokemonDetail`
- [X] T008 Implement `getEvolutionChain(chainId, currentPokemonId)` in [src/services/pokeapi.ts](src/services/pokeapi.ts) — fetch `/evolution-chain/:id`, pass to `parseEvolutionChain`, fan out `/pokemon/:id` batched for sprite hydration (swallow per-stage failures), return `EvolutionChain`. Also extend `getPokemonDetail` to extract `evolutionChainId` from species `evolution_chain.url`

**Checkpoint**: all Phase 2 tests green. Utilities + service ready for UI to consume.

---

## Phase 3: User Story 1 — Linear Evolution Path (Priority: P1) 🎯 MVP

**Goal**: A Pokémon with a linear chain (Bulbasaur, Charmander, Pikachu) shows its full chain in the Evolution section below the stats with stages, trigger-labeled arrows, current-stage highlight, and responsive horizontal/vertical orientation.

**Independent Test**: `/pokemon/4` → Evolution section has Charmander → Charmeleon → Charizard with arrows carrying trigger labels ("Lv. 16", "Lv. 36"); Charmander has the current-stage treatment.

### Tests (red → green)

- [X] T009 [P] [US1] Failing test [src/components/core/EvolutionStage/EvolutionStage.test.tsx](src/components/core/EvolutionStage/EvolutionStage.test.tsx) — non-current stage renders as `<a href="/pokemon/:id">` with title-cased name + `#NNN`; current stage (`isCurrent: true`) renders a `<div>` with `aria-current="page"` and is not a link; null `spriteUrl` shows placeholder, not broken image
- [X] T010 [P] [US1] Failing test [src/components/core/EvolutionEdge/EvolutionEdge.test.tsx](src/components/core/EvolutionEdge/EvolutionEdge.test.tsx) — renders label when `triggerLabel` provided, omits when null; wrapper uses `accessibleLabel` for `aria-label` (falls back to "evolves" when null); has `role="img"`; `data-orientation` attribute driven by `orientation` prop
- [X] T011 [P] [US1] Failing test [src/components/core/SkeletonEvolution/SkeletonEvolution.test.tsx](src/components/core/SkeletonEvolution/SkeletonEvolution.test.tsx) — `aria-busy="true"`; visually-hidden "Loading evolution chain" text present
- [X] T012 [US1] Failing test [src/components/core/EvolutionChain/EvolutionChain.test.tsx](src/components/core/EvolutionChain/EvolutionChain.test.tsx) — with MSW fixtures, linear Bulbasaur chain renders: heading `Evolution`, 3 stages in order, 2 edges with labels, Bulbasaur (as current) is non-interactive; loading state shows `SkeletonEvolution`
- [X] T013 [US1] Extend [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) — `/pokemon/1` integration: after main data loads, the Evolution section renders below stats and above abilities, populated with the Bulbasaur chain; resolve-order allows chain to still be loading while detail is loaded (asserts `SkeletonEvolution` briefly)

### Implementation

- [X] T014 [P] [US1] Implement [src/components/core/EvolutionStage/](src/components/core/EvolutionStage/) (`.tsx`, `.css`) — two render branches for current vs. navigable; stage entry fade-in with `--stage-index` staggered delay; export through barrel
- [X] T015 [P] [US1] Implement [src/components/core/EvolutionEdge/](src/components/core/EvolutionEdge/) — arrow glyph + optional label; CSS-driven responsive rotation via `data-orientation`; `role="img"` + `aria-label`; barrel export
- [X] T016 [P] [US1] Implement [src/components/core/SkeletonEvolution/](src/components/core/SkeletonEvolution/) — scoped skeleton matching chain height with `aria-busy` + SR text; barrel export
- [X] T017 [US1] Implement [src/components/core/EvolutionChain/](src/components/core/EvolutionChain/) — owns `useQuery(['evolution-chain', chainId])`, renders state-machine variants, wires `EvolutionStage` + `EvolutionEdge` in a responsive CSS-grid layout for the linear case (horizontal ≥ 720 px, vertical < 720 px); section `<h2>Evolution</h2>`; barrel export (depends on T014, T015, T016)
- [X] T018 [US1] Wire `<EvolutionChain chainId={data.evolutionChainId} currentPokemonId={data.id} />` into [src/pages/DetailPage/DetailPage.tsx](src/pages/DetailPage/DetailPage.tsx) between the stats and abilities sections; minor [DetailPage.css](src/pages/DetailPage/DetailPage.css) tweak for the section spacing
- [X] T019 [US1] Add `/preview` entries for `EvolutionStage` (default / current / null-sprite), `EvolutionEdge` (unlabeled / labeled "Lv. 16" / labeled "Fire Stone" / horizontal / vertical), `SkeletonEvolution`, and `EvolutionChain` linear-loaded variant in [src/pages/PreviewPage/PreviewPage.tsx](src/pages/PreviewPage/PreviewPage.tsx)

**Checkpoint**: US1 independently testable. T012 + T013 green. Manual: `/pokemon/4` shows full Charmander chain with labels and current highlight.

---

## Phase 4: User Story 2 — Navigate Between Chain Members (Priority: P1)

**Goal**: Clicking a non-current stage navigates to that Pokémon's detail page; current stage is non-interactive; keyboard works; browser back returns.

**Independent Test**: From Charmander's page, click Charizard card → lands on `/pokemon/6`, Charizard now current; press browser back → Charmander restored.

### Tests

- [X] T020 [US2] Extend [src/components/core/EvolutionStage/EvolutionStage.test.tsx](src/components/core/EvolutionStage/EvolutionStage.test.tsx) — clicking a non-current stage routes to `/pokemon/:id` (assert with `MemoryRouter` + location spy); clicking the current stage does nothing (no navigation, no route change); keyboard Enter on a focused stage activates the link
- [X] T021 [US2] Extend [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) — starting on `/pokemon/4`, click Charizard in the chain → URL becomes `/pokemon/6`, page renders Charizard as current with the same chain

### Implementation

- [X] T022 [US2] Confirm `EvolutionStage`'s current-vs-navigable rendering from T014 satisfies T020 — adjust if the initial implementation collapsed both cases. This is principally a test-driven reinforcement, not a new component.

**Checkpoint**: US1 + US2 both green. Manual: multi-hop navigation through Eevee family via chain cards works.

---

## Phase 5: User Story 3 — "Does Not Evolve" State (Priority: P2)

**Goal**: Pokémon with no evolutions (Tauros, Mew, etc.) show the Evolution section heading plus "This Pokémon does not evolve." — no cards, no arrows.

**Independent Test**: `/pokemon/128` (Tauros) → Evolution section has heading and the "does not evolve" copy, nothing else.

### Tests

- [X] T023 [US3] Extend [src/components/core/EvolutionChain/EvolutionChain.test.tsx](src/components/core/EvolutionChain/EvolutionChain.test.tsx) — feeding the MSW Tauros fixture, section renders the heading + "This Pokémon does not evolve." with no `EvolutionStage` or `EvolutionEdge` children
- [X] T024 [US3] Extend [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) — `/pokemon/128` integration: Evolution heading visible, "does not evolve" copy rendered, other sections (hero, stats, abilities) remain intact

### Implementation

- [X] T025 [US3] Add the `no-evolutions` branch to `EvolutionChain`'s render switch — short `<p>` with the canonical copy, section wrapper unchanged; ensure accessibility via the same heading so the section is not "empty" semantically
- [X] T025a [US3] Verify FR-018 (comparable visual space) — give the no-evolutions container a `min-height` in CSS that matches one populated stage-card's height so the detail-page layout does not shift between Pokémon. Add an assertion in [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) that the Evolution section element has the documented `min-height` class/style when in the no-evolutions state.

**Checkpoint**: US1 + US2 + US3 all green. Manual: Tauros and Mew both show the section + copy.

---

## Phase 6: User Story 4 — Branching Evolutions (Priority: P2)

**Goal**: Eevee + Vaporeon/Jolteon/Flareon render as a common ancestor with three parallel branches. Navigating to a sibling highlights that sibling and renders the same shape.

**Independent Test**: `/pokemon/134` (Vaporeon) → Eevee as root, three branches, Vaporeon highlighted. Click Jolteon → `/pokemon/135` with same shape, Jolteon highlighted.

### Tests

- [X] T026 [US4] Extend [src/components/core/EvolutionChain/EvolutionChain.test.tsx](src/components/core/EvolutionChain/EvolutionChain.test.tsx) — branching Eevee fixture renders 4 stages in source order (Eevee, Vaporeon, Jolteon, Flareon); 3 edges (Eevee → each of the three branches); exactly one stage has the current-stage treatment based on `currentPokemonId`; sibling ordering preserves fixture order
- [X] T027 [US4] Extend [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) — `/pokemon/134` shows Eevee family with Vaporeon highlighted; clicking Jolteon navigates to `/pokemon/135` where Jolteon is highlighted and Vaporeon and Flareon are visible as siblings

### Implementation

- [X] T028 [US4] Add a branching-aware layout to `EvolutionChain` — detect `chain.isBranching`, switch to a 2-column grid (column 1: common ancestor; column 2: stacked branches each preceded by its edge) on desktop; collapse to a single indented column on mobile; purely CSS + a class-name toggle, no new components
- [X] T029 [US4] Add `/preview` entries for `EvolutionChain` branching-loaded variant (Eevee fixture) in [src/pages/PreviewPage/PreviewPage.tsx](src/pages/PreviewPage/PreviewPage.tsx)

**Checkpoint**: US1–US4 green. Manual: branching family renders correctly at both breakpoints.

---

## Phase 7: User Story 5 — Scoped Error Handling (Priority: P3)

**Goal**: If the chain fetch fails, the Evolution section shows a scoped error with Retry. Rest of the detail page remains fully functional.

**Independent Test**: Force a 500 on `/api/v2/evolution-chain/:id`. Detail page still shows hero/stats/abilities. Evolution section shows `ErrorState` with Retry; clicking Retry re-fetches only the chain.

### Tests

- [X] T030 [US5] Extend [src/components/core/EvolutionChain/EvolutionChain.test.tsx](src/components/core/EvolutionChain/EvolutionChain.test.tsx) — on a mocked 500, section renders the reused `ErrorState` with message "Couldn't load the evolution chain." and a working Retry button; Retry re-triggers the query
- [X] T031 [US5] Extend [src/pages/DetailPage/DetailPage.test.tsx](src/pages/DetailPage/DetailPage.test.tsx) — simulate `evolution-chain` 500 while main detail succeeds. Assertions for SC-006 "rest of page remains fully interactive":
  - Hero / stats / abilities / flavor all render normally.
  - Evolution section shows scoped `ErrorState`.
  - **BackButton is still clickable** and fires navigation (assert via `MemoryRouter` location change or navigate spy).
  - **Main-detail Retry path is independent**: a subsequent test run where the main detail fetch itself fails shows the main `ErrorState` with a working Retry; the chain's error and the main error do not collide.
  - Retrying the chain after stub fix populates only the Evolution section; hero/stats/abilities do not re-render (verify with a render-spy or a stable DOM-node identity check).

### Implementation

- [X] T032 [US5] Add the `error` branch to `EvolutionChain`'s render switch — reuse `<ErrorState message="Couldn't load the evolution chain." onRetry={refetch} />`; ensure the query is configured with `retry: false` so the error surfaces promptly

**Checkpoint**: All five user stories independently testable.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T033 [P] Extend [src/pages/DetailPage/DetailPage.a11y.test.tsx](src/pages/DetailPage/DetailPage.a11y.test.tsx) — render a loaded Bulbasaur page and assert `axe` reports zero violations with the Evolution section present (color-contrast disabled as elsewhere)
- [X] T034 [P] Walk quickstart.md acceptance scenarios in-browser; record any drift as issues
- [X] T035 [P] Keyboard walkthrough: Tab from Back button through each navigable chain stage; Enter activates; current stage is skipped (non-focusable link target)
- [X] T036 [P] Verify motion budget — stage fade-in ≤ `--motion-fast`, edge label ≤ `--motion-base`, zeroed under `prefers-reduced-motion`
- [X] T037 [P] Performance: confirm section populated ≤ 2s on warm cache (SC-001) via DevTools
- [X] T038 Update "Recent Changes" in [CLAUDE.md](CLAUDE.md) with feature 007 summary
- [X] T039 Verify every variant in `/preview` matches the quickstart.md checklist for visual review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → no deps
- **Phase 2 (Foundational)** → depends on Phase 1; blocks all user stories
- **Phase 3 (US1 Linear)** → depends on Phase 2 — MVP slice for this feature
- **Phase 4 (US2 Navigation)** → depends on Phase 3 (needs `EvolutionStage` + `DetailPage` wiring)
- **Phase 5 (US3 No-Evolutions)** → depends on Phase 3 (extends the state machine)
- **Phase 6 (US4 Branching)** → depends on Phase 3 (reuses same components; adds layout branch)
- **Phase 7 (US5 Scoped Error)** → depends on Phase 3 (extends the state machine)
- **Phase 8 (Polish)** → runs after whichever user stories ship

### Within each story

- Tests first (red) → implementation until green
- Utilities before service; service before components; components before page integration
- Component tests before component implementation

### Parallel Opportunities

- **Phase 1**: T001, T002 in parallel
- **Phase 2**: T003, T005, T007 in parallel (tests); T004 after T003; T006 after T005; T008 after T006 + T007
- **Phase 3**: T009–T012 in parallel (tests); T014, T015, T016 in parallel (impl — independent files); T017 after T014+T015+T016; T013 can be authored in parallel with T017 (different files); T018 after T017; T019 after T014+T015+T016+T017
- **Phase 4**: T020 parallel with T021; T022 is mostly a verification/tweak pass
- **Phase 5**: T023 parallel with T024; T025 after both
- **Phase 6**: T026 parallel with T027; T028 after both; T029 after T028
- **Phase 7**: T030 parallel with T031; T032 after both
- **Phase 8**: T033–T037 all `[P]`; T038 after the rest; T039 verification

---

## Parallel Example: Phase 3 test authoring

```text
# All US1 test-authoring tasks in parallel (different files):
Task: "T009 Failing test for EvolutionStage"
Task: "T010 Failing test for EvolutionEdge"
Task: "T011 Failing test for SkeletonEvolution"
Task: "T012 Failing test for EvolutionChain (linear loaded + loading)"
```

---

## Implementation Strategy

### MVP (ship US1 only)

1. Phase 1 → Phase 2 → Phase 3 → validate T012 + T013 + manual walkthrough for linear chains → ship.
   - Caveat: without US2, chain cards won't actually navigate anywhere. US2 is lightweight (mostly a test + CSS/routing tweak) so prefer shipping US1 + US2 together unless time is tight.

### Incremental Delivery

1. Phase 1 + 2 → foundation
2. Phase 3 (US1) → test → demo the linear chain
3. Phase 4 (US2) → test → demo navigation
4. Phase 5 (US3) → test → demo non-evolving Pokémon
5. Phase 6 (US4) → test → demo Eevee family
6. Phase 7 (US5) → test → demo resilient error handling
7. Phase 8 polish → merge

### Parallel team strategy

After Phase 2 done:
- Dev A: Phase 3 (US1) — largest phase, sets up all the UI
- Dev B: once Phase 3 scaffolds the components (after T017), starts Phase 5 (US3) and Phase 7 (US5) — pure state-machine extensions with scoped tests
- Dev C: starts Phase 6 (US4) after T017 — branching layout is additive CSS

Phase 4 (US2) is small; often folded into Phase 3's PR.

---

## Notes

- `[P]` tasks touch different files and have no dependencies on incomplete tasks in the same batch.
- Constitution principle III (Test-First) is enforced: every implementation task has a corresponding failing test task earlier in the phase.
- Every new core component must get a `/preview` entry in the same phase it's introduced.
- The detail page's existing `useScrollRestore` hook is unaffected — chain-member navigation is a same-route update to a different `:id`, which triggers a natural detail-page re-render.
- Sibling-branch ordering preserves PokeAPI source order; tests must assert this explicitly so future refactors don't silently re-sort.
