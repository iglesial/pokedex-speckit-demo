# Data Model: Evolution Chain

**Feature**: 007-evolution-chain
**Date**: 2026-04-14

Pure client-side view models. No new persistence; all state is either URL (detail page `:id`) or React Query cache (chain data by `chainId`).

## Core Types

### `EvolutionStage`

A single node on the chain — one Pokémon's position.

```ts
interface EvolutionStage {
  pokemonId: number;   // 1..151 (filtered)
  name: string;        // lowercase kebab as returned by PokeAPI
  spriteUrl: string | null;  // derived; may require a side lookup (see §Hydration)
  isCurrent: boolean;  // true iff pokemonId === current detail-page id
}
```

**Validation**:
- `pokemonId ∈ [1, 151]`; anything else is filtered out during parse.
- `isCurrent` is set by the parser, not by the renderer.

### `EvolutionEdge`

A directed connection from one stage to another.

```ts
interface EvolutionEdge {
  fromPokemonId: number;
  toPokemonId: number;
  triggerLabel: string | null;  // short text: "Lv. 16", "Fire Stone", "Friendship", or null → omit label
  accessibleLabel: string | null; // long form: "evolves at level 16" (null when trigger not known)
}
```

**Validation**:
- Both endpoints MUST reference stages present in the chain's `stages` array.
- An edge whose `from` or `to` was filtered out by the Gen 1 cut is removed entirely; no synthetic reconnection.

### `EvolutionChain`

The fully-projected chain ready for rendering.

```ts
interface EvolutionChain {
  chainId: number;              // key for React Query cache
  stages: EvolutionStage[];     // in PokeAPI source order, post-filter
  edges: EvolutionEdge[];       // source order preserved
  hasNoEvolutions: boolean;     // true iff raw chain had exactly one node (no evolves_to)
  isBranching: boolean;         // true iff any stage has >1 outgoing edge
}
```

**Validation**:
- `stages` is non-empty after filtering. If every stage was filtered (can't happen for Gen 1 data, defensive), `getEvolutionChain` throws.
- `hasNoEvolutions` is set from the **raw** input, not post-filter (see research §5).
- `isBranching` is derived, not stored in the upstream model.

### `EvolutionSectionState` (UI-only)

Discriminated union driving the `<EvolutionChain>` component's rendering.

```ts
type EvolutionSectionState =
  | { tag: 'loading' }
  | { tag: 'loaded'; chain: EvolutionChain }
  | { tag: 'no-evolutions' }
  | { tag: 'error'; onRetry: () => void };
```

**Derivation rule** (implemented inside the `EvolutionChain` component):
- `useQuery` `isPending` → `loading`.
- `isError` → `error` with `onRetry = refetch`.
- Data loaded and `chain.hasNoEvolutions === true` → `no-evolutions`.
- Data loaded and `hasNoEvolutions === false` → `loaded`.

Per research §5, a post-filter single-stage chain is `loaded` (not `no-evolutions`); it simply renders one `EvolutionStage` with no edges, with that stage highlighted as current.

## Extension to Existing Types

### `PokemonDetail` (from feature 006) — add `evolutionChainId`

```ts
interface PokemonDetail {
  // ...existing fields from 006
  evolutionChainId: number;  // NEW — extracted from species.evolution_chain.url
}
```

This is a non-breaking addition. Existing callers of `getPokemonDetail` simply see a new field.

## Invariants

- **I1**: Every edge's `from` and `to` reference an existing stage in the same chain.
- **I2**: The `isCurrent` flag is set on at most one stage per chain; it is never set on the common ancestor of a branching chain unless the user is actually on that ancestor's detail page.
- **I3**: `hasNoEvolutions === true` implies `stages.length === 1 && edges.length === 0`.
- **I4**: `isBranching === true` implies at least one stage is the source of two or more edges.
- **I5**: Sibling-branch ordering preserves PokeAPI source order; the parser does not sort.
- **I6**: Current-stage cards are rendered as non-interactive (no anchor), never as disabled links (FR-009).

## Hydration strategy

PokeAPI's `/evolution-chain/:id` response contains species names but **no sprite URLs**. Options:

1. **Accept this** — `EvolutionStage.spriteUrl` may start as `null`; cards render a neutral placeholder immediately, then populate sprites asynchronously.
2. **Parallel per-stage fetch** — fan out to `/pokemon/:id` for each filtered stage to fill sprites.

**Decision (for V1 of this feature)**: Option 2, batched. After `parseEvolutionChain` produces the flat stage list, `getEvolutionChain` issues a single `Promise.all` over each stage's `/pokemon/:id` — the same request `getPokemonDetail` makes, so it'll hit the React Query cache for any Pokémon the user has already visited. Worst case for Eevee's chain: 4 requests (Eevee + 3 branches), all parallel, all cache-eligible after first visit.

**Rationale**: The chain is small (≤ 4 stages in Gen 1 for any case); the additional fetches are marginal and produce a visibly-complete section on first paint rather than two-stage hydration.

## State Transitions

```
mount
  ↓
useQuery(['evolution-chain', chainId])
  ├── pending → state: loading
  ├── error   → state: error { onRetry: refetch }
  └── success ─┬─ chain.hasNoEvolutions → state: no-evolutions
               └─ else                   → state: loaded

Retry path:
  error ─(refetch)→ loading → (success) loaded | no-evolutions
                            ↓
                            (error again) error
```

## Constants

No new constants beyond what already exists. `GEN1_RANGE` (from `src/config/catalog.ts`) is reused during parsing.

## CSS tokens

No new tokens. Existing tokens used:

- `--focus-ring` (current-stage border)
- `--shadow-sm`, `--shadow-md`, `--shadow-lg` (stage cards: default / hover / current)
- `--motion-fast`, `--motion-base`, `--ease` (stage fade-in, edge-label fade-in)
- `--fg-primary`, `--fg-muted`, `--bg-card`, `--border`, `--radius-sm`, `--radius-md` (card chrome)
- `--space-*` (spacing)

Custom property used internally (not a token): `--stage-index` for staggered entry animation delay.
