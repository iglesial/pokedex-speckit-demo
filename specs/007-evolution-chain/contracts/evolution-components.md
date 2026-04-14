# Contract: Evolution UI Components

Every new component ships Props typed in `src/components/index.ts`, colocated CSS + tests, and a `/preview` entry.

## `<EvolutionChain>`

```ts
interface EvolutionChainProps {
  chainId: number;
  currentPokemonId: number;  // used to mark isCurrent
}
```

**Behavior**:
- Owns its own `useQuery(['evolution-chain', chainId])` with `queryFn: () => getEvolutionChain(chainId, currentPokemonId)`.
- Renders one of four variants via `EvolutionSectionState`:
  - **loading** → `<SkeletonEvolution />`
  - **loaded** → responsive grid of `<EvolutionStage>` + `<EvolutionEdge>` based on `chain.isBranching`.
  - **no-evolutions** → short copy: "This Pokémon does not evolve." (FR-017)
  - **error** → `<ErrorState message="Couldn't load the evolution chain." onRetry={refetch} />`
- Section wrapper is `<section aria-labelledby="evolution-heading">` with `<h2 id="evolution-heading">Evolution</h2>`.

**Tests**: all four state variants render correctly; retry on error refetches; `<h2>Evolution</h2>` is always present; loading-to-loaded transition doesn't re-mount the heading.

---

## `<EvolutionStage>`

```ts
interface EvolutionStageProps {
  stage: EvolutionStage;  // { pokemonId, name, spriteUrl, isCurrent }
}
```

**Behavior**:
- When `isCurrent`: renders as a non-interactive `<div>` with class `evolution-stage--current`, `aria-current="page"`, no focus handling, no navigation.
- When not current: renders as a `<Link to="/pokemon/:id">` (React Router). Hoverable, keyboard-focusable, shares the elevation transition from other cards.
- Shows sprite (or placeholder if `spriteUrl` is null), title-cased name, `#NNN` ID.
- Fade-in entry animation with staggered `--stage-index` delay.

**Tests**:
- Current stage: is not a link; has `aria-current="page"`.
- Non-current stage: is a link with `href="/pokemon/:id"`; clicking routes (assert via `MemoryRouter` + location spy).
- Null spriteUrl shows placeholder, not broken image.
- Name is title-cased.

---

## `<EvolutionEdge>`

```ts
interface EvolutionEdgeProps {
  triggerLabel: string | null;     // null → no label rendered
  accessibleLabel: string | null;  // null → fallback "evolves" aria-label
  orientation?: 'horizontal' | 'vertical';  // defaults to CSS-driven responsive
}
```

**Behavior**:
- Renders an arrow glyph + optional short label.
- Wrapper has `aria-label={accessibleLabel ?? 'evolves'}`, `role="img"` so screen readers treat it as a single phrase.
- Responsive rotation is CSS-driven by default; the optional `orientation` prop exists for `/preview` deterministic rendering.

**Tests**:
- Renders label when provided; omits when null.
- `aria-label` uses `accessibleLabel` when provided; falls back to `"evolves"` when null.
- Orientation prop sets `data-orientation` for CSS to key off.

---

## `<SkeletonEvolution>`

```ts
interface SkeletonEvolutionProps {}
```

Scoped skeleton for the Evolution section only (not the whole page). Renders a stage card placeholder + arrow + another stage card placeholder so the section occupies comparable height to a populated chain (FR-020).

**Accessibility**: `aria-busy="true"` + visually-hidden "Loading evolution chain" text (mirrors the `SkeletonDetail` convention).

**Tests**: renders; busy state set; SR-only text present.

---

## DetailPage integration

**File**: `src/pages/DetailPage/DetailPage.tsx`

**Change**: when the main detail state is `loaded`, insert

```tsx
<EvolutionChain chainId={data.evolutionChainId} currentPokemonId={data.id} />
```

immediately below the stats `<section>` and above the abilities `<section>`. No other section order changes.

### DetailPage.test.tsx — new integration cases

- Bulbasaur (linear chain) → renders "Evolution" heading + 3 stages in order, current stage is Bulbasaur.
- Vaporeon (branching chain) → 4 stages, 3 edges, Vaporeon marked current; clicking Jolteon navigates to `/pokemon/135`.
- Tauros (no evolutions) → "This Pokémon does not evolve." rendered; no stages, no arrows.
- Simulated chain fetch error → `<ErrorState>` inside Evolution section only; rest of page intact; Retry refetches only the chain.
- Detail fetch succeeds but the chain fetch is still pending → hero/stats/abilities render; `<SkeletonEvolution>` visible.

### DetailPage.a11y.test.tsx — extension

- Render a loaded Bulbasaur page; assert `axe` reports zero violations with evolution section present.
