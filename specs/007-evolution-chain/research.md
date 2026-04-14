# Research: Evolution Chain

**Feature**: 007-evolution-chain
**Date**: 2026-04-14

All technical unknowns resolved from the constitution, the `react-core-component-architecture` standard, the parent scoping spec, the clarified feature spec, and PokeAPI conventions. No `NEEDS CLARIFICATION` markers remain.

## Decisions

### 1. How to reach the chain: species → evolution_chain.url → `/evolution-chain/:id`

- **Decision**: The PokeAPI species record (already fetched by `getPokemonDetail`) contains `evolution_chain: { url }`. We extract the trailing numeric id from that URL and add a **new** service call `getEvolutionChain(chainId)` that hits `/evolution-chain/:id`. `PokemonDetail` gains an `evolutionChainId: number` field so callers can pass it down without re-fetching species.
- **Rationale**: Reuses the species fetch the detail page already makes; avoids a redundant round-trip. Keeps chain fetching scoped to the Evolution section's own query so a failure there doesn't affect the rest of the page (FR-021).
- **Alternatives considered**: Fetching species a second time inside `EvolutionChain` — rejected as wasteful. Bundling species + chain into `getPokemonDetail` — rejected because it couples loading states (a chain-fetch failure would collapse the whole detail page).

### 2. Query key + cache policy

- **Decision**: `useQuery({ queryKey: ['evolution-chain', chainId], queryFn: () => getEvolutionChain(chainId), staleTime: 24h })`. Shares the persisted-cache policy already wired in `main.tsx`.
- **Rationale**: Chain data is effectively static; a 24h stale time gives near-instant repeat visits from any member of the same chain.

### 3. Chain parsing: recursive tree → flat stages + directional edges

- **Decision**: A new pure function `parseEvolutionChain(raw: PokeApiChainResponse, currentId: number): EvolutionChain` walks `chain.evolves_to[]` recursively, emitting `EvolutionStage` nodes and `EvolutionEdge` entries for each `from → to` relationship. The current Pokémon is marked via a boolean on its stage.
- **Rationale**: Keeps UI components consumption-only; the graph-shape → render-model transformation is the hard part and deserves its own unit test file.
- **Alternatives considered**: Parsing inline in the component — rejected: hard to test, mixes concerns.

### 4. Gen 1 filtering and "re-root" behavior (from Clarification Q3)

- **Decision**: During parse, any stage whose `pokemonId > 151` is removed along with its incident edges. After the pass, the chain is re-rooted on the first surviving stage:
  - If a removed stage was a pre-evolution, the remaining Gen 1 descendants become the new root(s).
  - If a removed stage was an intermediate in a linear chain (rare in Gen 1 source data), both sides are reconnected by dropping the edge through the removed node — no synthetic edge is created.
  - If the filter leaves nothing connected to the current Pokémon, the chain collapses to just the current Pokémon rendered as a single stage (FR-019a's "well-formed chain even with only one stage"). This is indistinguishable from a "single-stage Pokémon" — which is acceptable because the user is on Pokémon X and that's what they want to see.
- **Rationale**: Matches the clarified spec: silent truncation with reroot, no placeholder for removed ancestors.
- **Alternatives considered**: Keep a greyed-out placeholder for removed non-Gen-1 members (Option B in Q3) — rejected per clarification.

### 5. Distinguishing "no evolutions" vs. "Gen 1 truncation left a single stage"

- **Decision**: The `EvolutionChain` render-model carries a single derived flag `hasNoEvolutions: boolean`, set true only when the **raw** chain had exactly one node (no `evolves_to` entries at all). Post-truncation single-node chains do NOT set this flag — they render as a single stage with the "you are here" highlight and no arrows, which is visually identical to a literal solo Pokémon but semantically correct.
- **Rationale**: The "does not evolve" copy (FR-017) is a statement about canonical design, not about our filter. Showing it for a Pokémon whose pre-evolution simply didn't ship in Gen 1 (e.g., Pikachu with Pichu filtered out) would be misleading. In practice no Gen 1 Pokémon hits this edge case because every Gen 1 Pokémon is either solo or has a Gen 1 downstream evolution.
- **Alternatives considered**: Always show "does not evolve" for single-stage post-filter chains — rejected on truthfulness grounds.

### 6. Evolution trigger labels (from Clarification Q1)

- **Decision**: A new `formatEvolutionTrigger(details: PokeApiEvolutionDetail[]): string | null` picks the first detail entry and reduces it to a short label:
  - `trigger.name === 'level-up'` + `min_level` → `Lv. {n}`
  - `trigger.name === 'use-item'` → Title-cased item name (e.g., `Fire Stone`)
  - `trigger.name === 'trade'` → `Trade`
  - `trigger.name === 'level-up'` + `min_happiness` → `Friendship`
  - Any other combination → `null` (omit the label per FR-005b; the arrow still renders)
- **Rationale**: Covers every trigger present in Gen 1 chains. Returning `null` for exotic cases keeps the function total and pushes the "omit label" decision to a single place.
- **Alternatives considered**: Exhaustively model every PokeAPI field (time of day, held item, known move, location) — rejected: none of those apply to Gen 1 chains, and a generic fallback label like "Special" is noisier than simply omitting.

### 7. Responsive layout: horizontal desktop, vertical mobile (FR-006, FR-007)

- **Decision**: CSS Grid container with two breakpoint-driven rule sets. Desktop (≥ 720 px): `grid-auto-flow: column; grid-auto-columns: max-content`. Mobile (< 720 px): `grid-auto-flow: row`. Arrow rotation is CSS-driven — a single `.evolution-edge` element with `--edge-angle` custom property set to `0deg` (desktop) or `90deg` (mobile).
- **Rationale**: One DOM, two layouts; no JS for breakpoint detection. Aligns with the catalog's responsive pattern.
- **Alternatives considered**: Separate desktop and mobile components gated by `useMediaQuery` — rejected: unnecessary duplication.

### 8. Branching layout (Eevee case)

- **Decision**: Branching renders as a 2-column grid on desktop: column 1 holds the common ancestor, column 2 holds a vertical stack of branch stages each prefixed by its own edge. On mobile the whole thing collapses to a single column with an indented stack (common ancestor at top, branches below with a visible "from ancestor" arrow). Implementation uses CSS Grid with `grid-template-rows: repeat(N, auto)` where N is the number of branches.
- **Rationale**: Keeps sibling branches visually parallel without requiring a graph-layout library. Works for Gen 1's only real branch case (Eevee × 3) and any hypothetical future additions.
- **Alternatives considered**: A dedicated graph library (e.g., react-flow) — massive overkill for one three-branch case.

### 9. Highlighting the current Pokémon (from Clarification Q2)

- **Decision**: `EvolutionStage` accepts an `isCurrent: boolean` prop. When true, the card gains class `evolution-stage--current`, which applies:
  - Border: 2 px `solid` in the color of `--focus-ring`'s base hue (using a new derived CSS rule that reuses the existing token, no new palette entry).
  - Shadow: `--shadow-lg` instead of `--shadow-sm`.
  - `aria-current="page"` — semantic marker for assistive tech (FR-024).
  - No click handler (FR-009).
- **Rationale**: Token-sourced, a11y-correct, distinct from hover/focus-visible (which only apply `--shadow-md` + `--focus-ring` ring). The three states — default, hover/focus-visible, current — remain visually distinguishable per FR-008's collision clause.

### 10. Sibling-branch ordering

- **Decision**: Preserve PokeAPI source order. PokeAPI lists Eevee's branches in the order Vaporeon, Jolteon, Flareon — matching Gen 1 Dex order coincidentally. Our parser does not re-sort.
- **Rationale**: Stable, testable (snapshot-friendly), respects upstream canonical ordering.
- **Alternatives considered**: Sort by National Dex ID — would happen to be the same for Eevee, so no user-visible difference; kept source order for simplicity and predictability.

### 11. Independent error handling for the section

- **Decision**: `EvolutionChain` renders its own `useQuery` and owns its state machine (`loading` | `loaded` | `no-evolutions` | `error`). On error it renders the existing `ErrorState` component scoped to the section, with a Retry button that calls the query's `refetch()`. No impact on the parent `DetailPage`'s rendering.
- **Rationale**: Matches FR-021, FR-022. Reuses existing `ErrorState` to keep visual language consistent.

### 12. Motion & polish

- **Decision**: Stage cards fade-in with a `staggered` 50 ms delay per index (via `style={{ '--stage-index': i }}` + `animation-delay: calc(var(--stage-index) * 50ms)`) under `--motion-fast`. Edge labels fade in at `--motion-base`. Hero-style scale effects are **not** used — the chain is a navigation aid, not a hero.
- **Rationale**: Fits the polish budget while keeping visual weight subordinate to the detail-page hero. Zeroed automatically by the global reduced-motion override already in `src/index.css`.

### 13. Accessibility

- **Decision**:
  - Each clickable stage is an `<a href="/pokemon/:id">` (consistent with catalog cards); anchor name = "Pokémon name" (title-cased).
  - Current stage uses `aria-current="page"` and is a non-interactive element (`<div>`), not a link (FR-009).
  - Edge trigger labels are rendered as plain text with `aria-label="evolves at level 16"` on the edge wrapper (FR-023 + clarification-updated assumption).
  - Section wrapper has `aria-labelledby="evolution-heading"` pointing at the `<h2>Evolution</h2>`.
  - Loading skeleton carries `aria-busy="true"` + visually-hidden status text matching the detail-page skeleton pattern.
- **Rationale**: Meets FR-016, FR-023, FR-024, FR-025 and mirrors the conventions from features 002 and 006.

### 14. Testing strategy

- **Decision**:
  - Unit tests: `parseEvolutionChain` (linear / branching / Gen-1-truncation / no-evolutions inputs); `formatEvolutionTrigger` (level / stone / friendship / trade / unknown / multiple items); each component (`EvolutionStage`, `EvolutionEdge`, `SkeletonEvolution`, `EvolutionChain`).
  - Integration test: extend `DetailPage.test.tsx` with evolution-section cases (linear Bulbasaur chain, branching Eevee chain, Tauros no-evolutions, scoped error + retry).
  - a11y: `DetailPage.a11y.test.tsx` expanded to render the fully loaded state including the evolution section and assert no axe violations (color-contrast disabled as before).
- **Rationale**: Mirrors the feature 006 test layout; keeps integration surface bounded to one file.

## Open Questions

None.
