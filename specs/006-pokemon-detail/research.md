# Research: Pokémon Detail Page

**Feature**: 006-pokemon-detail
**Date**: 2026-04-13

All technical unknowns resolved from the constitution, the `react-core-component-architecture` standard, the parent scoping spec, and the catalog feature's established patterns. No `NEEDS CLARIFICATION` markers remain.

## Decisions

### 1. Route layer: reuse existing `/pokemon/:id` from `App.tsx`

- **Decision**: The route already exists as a stub; this feature swaps the stub component for the real `DetailPage`. No router changes.
- **Rationale**: Minimum churn; keeps back-nav history behavior untouched.
- **Alternatives considered**: Adding a separate nested route for error states — rejected, render-conditional is simpler and keeps the URL stable.

### 2. Data fetching: single orchestrator that combines `/pokemon/{id}` + `/pokemon-species/{id}`

- **Decision**: Add `getPokemonDetail(id): Promise<PokemonDetail>` to `services/pokeapi.ts`. It fetches both endpoints in parallel (`Promise.all`), maps to a single domain object, and throws a typed `PokemonNotFoundError` for IDs outside `[1, 151]` or 404 responses.
- **Rationale**: One query per page keeps `useQuery` ergonomics simple and cache keys clean (`['pokemon-detail', id]`). Parallel fetches minimize latency toward SC-001.
- **Alternatives considered**: Two separate `useQuery` calls (or `useQueries`) — rejected: more ceremony, two loading flags to juggle, and no latency benefit over `Promise.all`.

### 3. ID parsing and range validation: clamp at the UI edge, throw at the service edge

- **Decision**: `DetailPage` reads `:id` from `useParams`, coerces via `parseInt(id, 10)`; if the result is `NaN` or outside `[1, 151]`, render `NotFoundState` directly without firing a query. Otherwise the service layer validates again (defense in depth) and throws `PokemonNotFoundError` on failure.
- **Rationale**: Short-circuit prevents a pointless network call for malformed URLs and meets SC-004 (not-found state within 1s).
- **Alternatives considered**: Letting the query fire and interpreting 404 — rejected: slower; pollutes the query cache with useless error entries.

### 4. Flavor-text selection: most recent English entry, whitespace-normalized

- **Decision**: Filter `flavor_text_entries` to `language.name === 'en'`, pick the last one (PokeAPI orders oldest-first), run it through `normalizeFlavor(text)` which replaces `\f`, `\u00AD`, `\n`, `\u00A0`, and collapses consecutive whitespace.
- **Rationale**: Modern entries match the language/tone users expect; normalization cleans up PokeAPI's legacy form-feed/newline encoding that otherwise shows up as broken layout.
- **Alternatives considered**: First English entry (earliest game) — rejected: older wording can feel quaint but many Gen 1 entries are fine either way, so picking "most recent" keeps it consistent and simpler than a per-species override.

### 5. Stat bars: fixed max of 255 with percentile color banding

- **Decision**: Each `StatBar` renders a filled track whose width is `value / 255 * 100%`. Color bands: 0–49 → `--stat-low`, 50–99 → `--stat-mid`, 100+ → `--stat-high`. All three band colors are new CSS custom properties added to `src/index.css`.
- **Rationale**: 255 is PokeAPI's theoretical cap; anchoring every bar to the same max makes relative comparisons meaningful across Pokémon (SC-003). Banded colors give a quick glanceable signal without needing numbers.
- **Alternatives considered**: Per-Pokémon max (scaling to this Pokémon's highest stat) — rejected: removes cross-Pokémon comparability, which is the whole point of SC-003.

### 6. Height & weight formatting

- **Decision**: PokeAPI returns height in decimetres and weight in hectograms. Convert in `utils/formatMeasurements.ts`: `m = height / 10`, `kg = weight / 10`. Format as "1.7 m" and "90.5 kg" (one decimal, no trailing zeros removed).
- **Rationale**: Matches the spec's FR-006 and Assumptions. One decimal is precise enough without being pedantic for tiny Pokémon (0.3 m).
- **Alternatives considered**: Imperial conversions — deferred to V2; out of MVP scope.

### 7. Hero artwork entry motion

- **Decision**: CSS keyframes `heroReveal` applied to the artwork `<img>` on mount: `transform: scale(0.92) → 1; opacity: 0 → 1; duration: var(--motion-slow) (400 ms); easing: var(--ease)`. Wrapped under `@media (prefers-reduced-motion: reduce)` with `animation-duration: 1ms` override.
- **Rationale**: Fits the spec's "subtle scale + fade" and stays within the motion budget. Plain CSS keeps the bundle lean and satisfies the global reduced-motion override already in `src/index.css`.
- **Alternatives considered**: Framer Motion — rejected: ~40 KB for an effect CSS handles in ten lines.

### 8. Back control behavior

- **Decision**: `BackButton` component calls `navigate(-1)` if `window.history.state?.idx > 0` (meaning there's a prior entry in this SPA's history) — equivalent to "browser back". Otherwise it navigates to `/`. This mirrors browser back-button UX: returning to the catalog at the exact URL (page/search/filter) pushed on departure.
- **Rationale**: React Router v6 exposes the `idx` in history state; a falsy check detects deep-link arrivals (no in-app history). This keeps FR-011/12/13 satisfied using only framework primitives.
- **Alternatives considered**: Reading a "return URL" from sessionStorage — rejected: duplicates what the browser already tracks; adds state that can get out of sync.

### 9. Scroll + focus restoration on back-nav

- **Decision**: Continue using `useScrollRestore()` on `HomePage`. No changes needed — the hook already fires once per HomePage mount (post-fix from the polish phase), so back-nav from the detail page (which remounts HomePage) correctly restores scroll and focus.
- **Rationale**: The existing contract already covers SC-002 for this feature. No duplication.
- **Alternatives considered**: A symmetric `useScrollRestore` on DetailPage — not needed; detail pages are rarely revisited in a session.

### 10. Skeleton layout

- **Decision**: `SkeletonDetail` renders the full layout (hero block + stats rows + abilities block + flavor block) with shimmer boxes of the correct shape so the layout does not shift when data lands. Page-level skeleton is rendered while `isPending`; individual sub-section skeletons are not needed.
- **Rationale**: One fullscreen skeleton is cheaper cognitively than six partial ones and still meets FR-014. Avoids layout thrash when sections arrive.
- **Alternatives considered**: Per-section streaming skeletons — rejected: overkill for one round-trip that covers the whole page.

### 11. Error vs not-found vs loading states

- **Decision**: `DetailPage` switches on a discriminated union `state: "loading" | "loaded" | "error" | "not-found"`. Selection logic:
  - `parseId(params.id)` fails or is out-of-range → `"not-found"` (no fetch).
  - `useQuery` `isPending` → `"loading"`.
  - `useQuery` `isError` and the error is `PokemonNotFoundError` → `"not-found"`.
  - `useQuery` `isError` otherwise → `"error"` with retry.
  - `useQuery` `data` present → `"loaded"`.
- **Rationale**: Mapping to a discriminated union avoids deeply nested ternaries; matches FR-015/16 exactly.
- **Alternatives considered**: Let `useQuery` retry `NotFound` automatically — rejected: retrying a 404 is wasteful and masks the intended UX.

### 12. a11y for transient states

- **Decision**: `SkeletonDetail` wrapper is `aria-busy="true"` and contains a visually-hidden "Loading Pokémon details" text so screen readers know the status. `ErrorState` already has `role="alert"`. `NotFoundState` uses `role="status"` with an assertive enough title.
- **Rationale**: FR-017. Reuses the existing `ErrorState` component from feature 002; adds one new component (`NotFoundState`) and one `aria-busy` attribute.
- **Alternatives considered**: Live-region announcements via `aria-live` — overkill for a one-shot state change per page load.

### 13. Testing approach

- **Decision**: Unit tests per new core component; one integration test `DetailPage.test.tsx` covers loaded/loading/error/not-found/back-nav flows via MSW and `sessionStorage` assertions. One a11y test `DetailPage.a11y.test.tsx` runs `jest-axe` on the loaded page (with `color-contrast` disabled as in the catalog).
- **Rationale**: Matches the constitution + catalog precedent. Keeps the test surface consistent across features.
- **Alternatives considered**: E2E with Playwright — deferred, good follow-up for both features 002 and 006.

## Open Questions

None.
