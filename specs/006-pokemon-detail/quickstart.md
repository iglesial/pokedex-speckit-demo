# Quickstart: Pokémon Detail Page

**Feature**: 006-pokemon-detail

Assumes the catalog feature (002) is already merged to `main` — the route, PokeAPI client shape, React Query setup, design tokens, and `useScrollRestore` are pre-existing.

## Run

```bash
npm run dev
# open http://localhost:5173/pokemon/6   → Charizard
# open http://localhost:5173/pokemon/025 → Pikachu (leading zeros work)
# open http://localhost:5173/pokemon/999 → "not found" state
```

## Walk the acceptance scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| US1.1 — direct URL, valid ID | Open `/pokemon/6` | Within ~2s: Charizard artwork (with entry motion), "Charizard" `<h1>`, `#006`, Fire + Flying badges, 6 stat bars, "1.7 m" + "90.5 kg", Blaze ability (+ Solar Power as Hidden), English flavor text |
| US1.3 — skeleton | Throttle network, open `/pokemon/25` | Full-page skeleton visible first; no layout shift when data arrives |
| US1.5 — hidden ability flagged | Any Pokémon with a hidden ability | "Hidden" label or muted treatment distinguishes it from regular abilities |
| US1.6 — missing flavor text | Simulated fixture with no English entry | Flavor-text section omitted entirely; layout intact |
| US2.1 — back restores catalog state | From `/?q=char&types=fire&page=2` click any card → detail → click "Back to catalog" | Return to `/?q=char&types=fire&page=2`, scrolled to the card |
| US2.3 — deep link | Open `/pokemon/6` directly → click back control | Land on `/` (no prior history) |
| US3.1 — invalid id | Open `/pokemon/abc` | Not-found state with "Back to catalog" link; no network request made |
| US3.2 — upstream 500 | Simulate 500 on `/pokemon/25` | Error state with Retry; after retry + success, Pikachu renders |
| Edge — leading zeros | Open `/pokemon/0006` | Charizard renders |
| Edge — reduced motion | OS-level reduced-motion setting enabled | Hero artwork appears without scale/fade animation |

## Run tests

```bash
npm test          # Vitest watch
npm run test:run  # CI mode
```

Required coverage before merge:
- Every component in `contracts/detail-components.md` has a colocated test.
- `DetailPage.test.tsx` integration test covers loaded/loading/error/not-found/back-nav.
- `DetailPage.a11y.test.tsx` axe smoke test passes.
- `getPokemonDetail` service tests cover valid / out-of-range / 404 / flavor-text normalization / no-English-flavor.

## Visual review on `/preview`

Add entries for every new component:

- `DetailHero`: sample Pokémon with 1 type; sample with 2 types; artwork-null fallback; reduced-motion (static).
- `StatBar`: low (HP 45), mid (Atk 80), high (Sp.Atk 150), clamped (fake 300), zero (0).
- `AbilityList`: one regular + one hidden; two regular + no hidden; all hidden.
- `SkeletonDetail`: static.
- `NotFoundState`: default; with id; with bogus id "abc".
- `BackButton`: default; with custom label.

## Where things live

- Spec: [spec.md](./spec.md)
- Plan: [plan.md](./plan.md)
- Research: [research.md](./research.md)
- Data model: [data-model.md](./data-model.md)
- Contracts: [contracts/](./contracts/)
- Parent scope: [../001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)
- Catalog feature: [../002-pokemon-catalog/](../002-pokemon-catalog/)
- Constitution: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
