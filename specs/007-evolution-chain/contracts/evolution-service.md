# Contract: Evolution Service

## `getEvolutionChain(chainId): Promise<EvolutionChain>`

**Module**: `src/services/pokeapi.ts` (extend existing)

```ts
async function getEvolutionChain(
  chainId: number,
  currentPokemonId: number,
): Promise<EvolutionChain>;
```

### Behavior

1. `GET /evolution-chain/:chainId` — parse the nested `chain` tree.
2. Walk the tree (depth-first, source-order) producing:
   - `stages[]` — one entry per node in `evolves_to` closure, including the root.
   - `edges[]` — one entry per `from → to` relationship.
3. Filter `stages` to Pokémon with `id ∈ [1, 151]`. Drop edges whose endpoints were filtered.
4. Re-root: if filtering removed the original root, the new root(s) are the surviving stage(s) with no remaining inbound edges.
5. Mark `isCurrent` on the stage whose `pokemonId === currentPokemonId`.
6. Fan-out `/pokemon/:id` fetches for each surviving stage (`Promise.all`) to hydrate `spriteUrl` (official-artwork preferred, front_default fallback). Per-stage fetch failures degrade gracefully: `spriteUrl: null` for that stage; the rest of the chain still populates.
7. Compute `hasNoEvolutions` from the RAW tree: true iff `chain.evolves_to.length === 0`.
8. Compute `isBranching` from final edges: true iff any stage is source of ≥ 2 edges.
9. Return `EvolutionChain`.

### Errors

- Chain endpoint 4xx/5xx → throws `PokeApiError` (existing). Caller (`EvolutionChain` component) maps to the `error` state.
- Per-stage sprite fetch errors are **swallowed** — they MUST NOT fail the whole call. Failed stages render with `spriteUrl: null`.

### Cache key

`['evolution-chain', chainId]`. `staleTime: 24h`. Shares the `persistQueryClient` treatment.

---

## `parseEvolutionChain(raw, currentPokemonId): ParsedChain`

**Module**: `src/utils/parseEvolutionChain.ts` (new, pure)

```ts
interface ParsedChain {
  chainId: number;
  stages: Array<{ pokemonId: number; name: string; isCurrent: boolean }>;
  edges: Array<{
    fromPokemonId: number;
    toPokemonId: number;
    triggerLabel: string | null;
    accessibleLabel: string | null;
  }>;
  hasNoEvolutions: boolean;
  isBranching: boolean;
}

function parseEvolutionChain(
  raw: PokeApiChainResponse,
  currentPokemonId: number,
): ParsedChain;
```

Pure, synchronous. No network. Used by `getEvolutionChain` after fetch and directly by unit tests with canned fixtures.

### Test cases (required in `parseEvolutionChain.test.ts`)

- Linear 3-stage chain (Bulbasaur family) → 3 stages, 2 edges, `!isBranching`, `!hasNoEvolutions`.
- Linear 2-stage chain (Pikachu family) with Pichu filtered out → 2 stages, 1 edge, `!isBranching`, `!hasNoEvolutions`. Root is Pikachu.
- Branching chain (Eevee) → 4 stages, 3 edges, `isBranching`, `!hasNoEvolutions`.
- No-evolution chain (Tauros) → 1 stage, 0 edges, `hasNoEvolutions === true`.
- `isCurrent` is set on exactly the stage matching `currentPokemonId`; it's false on all others.
- Trigger labels: level-up + min_level → `Lv. {n}`; use-item Fire Stone → `Fire Stone`; trade → `Trade`; level-up + min_happiness → `Friendship`; unknown trigger → label is `null`.

---

## `formatEvolutionTrigger(details): { short, accessible } | null`

**Module**: `src/utils/formatEvolutionTrigger.ts` (new, pure)

```ts
interface EvolutionTriggerLabel {
  short: string;        // "Lv. 16", "Fire Stone", "Friendship", "Trade"
  accessible: string;   // "evolves at level 16", "evolves when given Fire Stone", etc.
}

function formatEvolutionTrigger(
  details: PokeApiEvolutionDetail[],
): EvolutionTriggerLabel | null;
```

Returns `null` when no detail entry yields a recognized label → the arrow renders unlabeled (FR-005b). Uses only the **first** detail entry per edge (PokeAPI orders the primary trigger first).

### Test cases

- `[{ trigger: 'level-up', min_level: 16 }]` → `{ short: "Lv. 16", accessible: "evolves at level 16" }`.
- `[{ trigger: 'use-item', item: { name: 'fire-stone' } }]` → `{ short: "Fire Stone", accessible: "evolves when given Fire Stone" }`.
- `[{ trigger: 'level-up', min_happiness: 160 }]` → `{ short: "Friendship", accessible: "evolves with high friendship" }`.
- `[{ trigger: 'trade' }]` → `{ short: "Trade", accessible: "evolves when traded" }`.
- `[{ trigger: 'shed' }]` → `null` (unknown trigger — no Gen 1 case anyway).
- `[]` → `null` (defensive).
