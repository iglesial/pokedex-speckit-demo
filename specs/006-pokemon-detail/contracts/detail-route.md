# Contract: Detail Route + Back Navigation

## Route

- **Path**: `/pokemon/:id`
- **Valid `:id`**: integer in `[1, 151]`, optionally with leading zeros (`6`, `006`, `0006` all equal `6`).
- **Invalid `:id`**: anything else renders `NotFoundState` without firing a network request.

## URL examples

| URL | Behavior |
|-----|----------|
| `/pokemon/1` | Bulbasaur detail |
| `/pokemon/006` | Charizard detail (leading zeros tolerated) |
| `/pokemon/25` | Pikachu detail |
| `/pokemon/151` | Mew detail |
| `/pokemon/0` | Not-found |
| `/pokemon/152` | Not-found |
| `/pokemon/abc` | Not-found |
| `/pokemon/25.5` | Not-found |

## Back navigation contract

- **From in-app navigation** (user clicked a catalog card): `BackButton` invokes `navigate(-1)`. The browser restores the exact URL the catalog was at on departure (e.g., `/?q=char&types=fire&page=2`). The existing `useScrollRestore()` on `HomePage` then restores scroll + focused card.
- **From deep link** (no in-app history): `BackButton` invokes `navigate('/', { replace: false })`. Detected via `window.history.state?.idx === 0` (or undefined).
- **Keyboard & gesture parity**: the browser back button, Alt+Left, and the swipe-back gesture on touch all produce the same outcome because they use the same History API.

## Error handling contract

Detail page renders one of four visual states:

| `DetailPageState.tag` | Component rendered | Announces via |
|----------------------|--------------------|---------------|
| `loading` | `SkeletonDetail` | `aria-busy="true"` + visually-hidden "Loading Pokémon details" |
| `loaded` | `DetailHero` + stats + abilities + flavor | — |
| `error` | `ErrorState` with `onRetry` | `role="alert"` |
| `not-found` | `NotFoundState` with link to `/` | `role="status"` |

Exactly one state is active at a time (no mixed states, no overlays).

## Required tests

`src/pages/DetailPage/DetailPage.test.tsx` MUST cover:

1. Valid ID renders hero + stats + abilities + flavor after MSW resolves.
2. URL with leading zeros (`/pokemon/006`) resolves to the same Pokémon as `/pokemon/6`.
3. Invalid ID (`/pokemon/abc`) renders NotFoundState without a network request (assert via MSW handler call-count).
4. Out-of-range ID (`/pokemon/999`) renders NotFoundState.
5. 404 from upstream renders NotFoundState.
6. 500 from upstream renders ErrorState with a working Retry button.
7. Skeleton is visible before data resolves; gone after.
8. BackButton navigates back when history has prior entries; otherwise navigates to `/`.

`src/pages/DetailPage/DetailPage.a11y.test.tsx` MUST run `jest-axe` against the loaded state with `color-contrast` disabled.
