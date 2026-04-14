# Contract: Detail Page UI Components

Every new component ships Props typed in `src/components/index.ts`, colocated CSS + tests, and an entry in `/preview`.

## `<DetailHero>`

```ts
interface DetailHeroProps {
  pokemon: PokemonDetail;
}
```

**Renders**:
- Artwork (img, lazy-loaded after placeholder), with a `heroReveal` entry animation on mount.
- Name (title-cased, `<h1>`).
- `#NNN` ID.
- Type badges (reuses `<TypeBadge>`).
- Height + weight, formatted via `utils/formatMeasurements`.

**Tests**: renders all fields; animation disabled under reduced-motion; artwork fallback chain when `artworkUrl` is null.

---

## `<StatBar>`

```ts
interface StatBarProps {
  label: string;       // e.g. "HP", "Sp. Atk"
  value: number;
  max?: number;        // default STAT_MAX (255)
  id?: string;
}
```

**Renders**:
- `<div role="img" aria-label="${label} ${value} out of ${max}">` containing a labeled track + filled bar.
- Fill width = `min(value / max, 1) * 100%`.
- Fill color uses data attribute `data-band="low" | "mid" | "high"` driven by `STAT_BANDS`.

**Tests**: width calculation at 0 / 50 / 100 / 150 / 255 / 300 (clamp); correct `data-band`; `aria-label` includes label + value + max.

---

## `<AbilityList>`

```ts
interface AbilityListProps {
  abilities: PokemonAbility[];
}
```

**Renders**:
- `<ul>` of abilities. Regular abilities first, then hidden abilities under a visually distinguished treatment (label "Hidden" + muted styling).

**Tests**: two regular + one hidden → correct rendering order and label; zero hidden → no "Hidden" header; all-hidden edge case (not expected in Gen 1 but defensive).

---

## `<SkeletonDetail>`

```ts
interface SkeletonDetailProps {}
```

Renders a full-page skeleton matching the loaded layout. `aria-busy="true"` on the wrapper; visually-hidden status text for SR users.

**Tests**: renders; status text present for a11y.

---

## `<NotFoundState>`

```ts
interface NotFoundStateProps {
  id?: string;  // the raw :id from the URL, for display
}
```

**Renders**:
- `role="status"` wrapper.
- Icon + heading ("No Pokémon with ID {id}" when provided, else "No Pokémon found").
- `<Link to="/">` "Back to catalog".

**Tests**: renders default heading; renders ID-specific heading; link targets `/`.

---

## `<BackButton>`

```ts
interface BackButtonProps {
  fallbackTo?: string;  // default '/'
  label?: string;       // default 'Back to catalog'
}
```

**Renders**:
- `<button>` with chevron + label.
- On click: if `window.history.state?.idx > 0`, call `navigate(-1)`; otherwise `navigate(fallbackTo)`.
- Keyboard-reachable, focus-visible styled.

**Tests**: click with history.idx=2 → `navigate(-1)`; click with history.idx=0 → `navigate('/')`; keyboard activation (Enter/Space).

---

## Service addition: `getPokemonDetail(id)`

```ts
async function getPokemonDetail(id: number): Promise<PokemonDetail>;
```

- Validates `id ∈ [1, 151]`; else throws `PokemonNotFoundError`.
- `Promise.all([GET /pokemon/{id}, GET /pokemon-species/{id}])`.
- Maps to `PokemonDetail`; selects most recent English flavor text and runs `normalizeFlavor`.
- Cache key: `['pokemon-detail', id]`, inherits React Query's 24h `staleTime`.
- On any upstream 404 → throws `PokemonNotFoundError`.

**Tests** in `src/services/pokeapi.test.ts`:
- Happy path returns `PokemonDetail` with expected shape.
- Out-of-range id throws `PokemonNotFoundError` without network.
- Upstream 404 throws `PokemonNotFoundError`.
- Flavor text normalization strips `\f`, `\u00A0`, `\n` and collapses whitespace.
- Pokémon with only non-English flavor text → `flavorText === null`.

---

## Utilities

### `utils/formatMeasurements.ts`

```ts
export function formatHeight(decimetres: number): string;   // "1.7 m"
export function formatWeight(hectograms: number): string;   // "90.5 kg"
```

### `utils/normalizeFlavor.ts`

```ts
export function normalizeFlavor(text: string): string;
```

Strips `\f` (form feed), `\u00A0` (non-breaking space), `\u00AD` (soft hyphen), normalizes line breaks to single spaces, collapses consecutive whitespace.

### `utils/formatStat.ts`

```ts
export function statLabel(key: keyof BaseStats): string;    // "Sp. Atk"
export function statBand(value: number): 'low' | 'mid' | 'high';
```

Each utility ships a colocated unit test covering the edge cases in its signature.
