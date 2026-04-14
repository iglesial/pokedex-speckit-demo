# Data Model: Pokémon Detail Page

**Feature**: 006-pokemon-detail
**Date**: 2026-04-13

Client-side TypeScript types backed by PokeAPI responses. No server-side persistence introduced; the detail page is purely view state.

## Core Types

### `PokemonDetail`

The primary entity for the detail page. A projection of `/pokemon/{id}` + `/pokemon-species/{id}`.

```ts
interface PokemonDetail {
  id: number;                // 1..151
  name: string;              // lowercase kebab from API
  types: PokemonType[];      // 1..2
  artworkUrl: string | null; // official-artwork preferred, front_default fallback
  stats: BaseStats;          // six values, keyed by stat name
  heightDecimetres: number;  // raw, formatted by utils/formatMeasurements
  weightHectograms: number;  // raw, formatted by utils/formatMeasurements
  abilities: PokemonAbility[];
  flavorText: string | null; // normalized; null if no English entry
}
```

**Validation rules**:
- `id ∈ [1, 151]`; otherwise the service throws `PokemonNotFoundError` and the page renders "not-found".
- `types.length ∈ {1, 2}`.
- `abilities` preserves API order; `slot` is not surfaced since we render them as a list.
- `flavorText` is `null` when no English entry exists — consumers MUST omit the section, not render `null`.

### `BaseStats`

```ts
interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}
```

Derived from `stat[].base_stat` in the `/pokemon/{id}` response, matched by `stat.name`:
- `hp` ← `hp`
- `attack` ← `attack`
- `defense` ← `defense`
- `specialAttack` ← `special-attack`
- `specialDefense` ← `special-defense`
- `speed` ← `speed`

Each value is rendered by `<StatBar>` with `max = 255`.

### `PokemonAbility`

```ts
interface PokemonAbility {
  name: string;       // title-cased for display
  isHidden: boolean;  // API's is_hidden field
}
```

**Rendering rule**: abilities with `isHidden: true` MUST be visually distinguished (e.g., a "Hidden" label or a muted chip variant) per FR-007.

### `DetailPageState` (UI-only)

```ts
type DetailPageState =
  | { tag: 'loading' }
  | { tag: 'loaded'; pokemon: PokemonDetail }
  | { tag: 'error'; onRetry: () => void }
  | { tag: 'not-found' };
```

Derived by `DetailPage.tsx` from `useParams`, `parseId`, and `useQuery`. See research.md §11 for the selection logic.

### Errors

```ts
class PokemonNotFoundError extends Error {
  constructor(public id: number);
}
```

Thrown by `getPokemonDetail(id)` when:
- `id` is outside `[1, 151]`, or
- The upstream `/pokemon/{id}` call returns 404 (PokeApiError with status 404).

## Invariants

- **I1**: If `DetailPageState.tag === 'not-found'`, no network request was made (or all requests have resolved with not-found). The `NotFoundState` component is rendered exclusively.
- **I2**: The flavor-text section is not rendered at all when `flavorText === null`. Consumers MUST NOT display `null`, empty string, or a placeholder.
- **I3**: Stat bar widths are computed as `min(value / 255, 1) * 100%`. Values > 255 (not expected in Gen 1 but defensive) clamp to 100%.
- **I4**: Abilities are rendered in API order. Regular abilities first, then hidden abilities — implemented by `[...regular, ...hidden]` grouping to keep hidden visually separated.

## State Transitions

```
mount
  ↓
parseId(params.id)
  ├── invalid/out-of-range → not-found
  └── valid → loading
                  ↓
        useQuery(['pokemon-detail', id])
          ├── success → loaded
          ├── error (PokemonNotFoundError) → not-found
          └── error (other) → error { onRetry: refetch }
                  ↓
                retry → loading
```

## Constants (new)

Added to `src/config/catalog.ts` (or a new `src/config/detail.ts` if it grows):

```ts
export const STAT_MAX = 255;

// Percentile bands for color coding — used by StatBar's CSS
export const STAT_BANDS = {
  low: 50,
  mid: 100,
  // everything ≥ mid is "high"
} as const;
```

And new tokens in `src/index.css`:

```css
--stat-low: #ef6f6c;    /* muted red */
--stat-mid: #f0c36c;    /* amber */
--stat-high: #7cc77a;   /* green */
--stat-track: rgba(20, 24, 48, 0.08);
```
