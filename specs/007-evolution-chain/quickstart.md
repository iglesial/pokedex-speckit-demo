# Quickstart: Evolution Chain

**Feature**: 007-evolution-chain

Assumes the detail page (feature 006) is in place — route `/pokemon/:id` renders hero + stats + abilities + flavor. This feature adds a new section.

## Run

```bash
npm run dev
# open http://localhost:5173/pokemon/1   → Bulbasaur (linear 3-stage)
# open http://localhost:5173/pokemon/25  → Pikachu (2-stage after Gen 1 truncation)
# open http://localhost:5173/pokemon/134 → Vaporeon (branching Eevee family)
# open http://localhost:5173/pokemon/128 → Tauros (does not evolve)
# open http://localhost:5173/pokemon/151 → Mew (does not evolve)
```

## Walk the acceptance scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| US1.1 — linear chain | `/pokemon/4` (Charmander) | "Evolution" section below stats; 3 cards in order Charmander → Charmeleon → Charizard; Charmander highlighted |
| US1.3 — desktop layout | Viewport ≥ 720 px | Chain arranged horizontally, arrows point left → right |
| US1.4 — mobile layout | Viewport < 720 px | Chain stacks vertically, arrows point top → bottom |
| US2.1 — navigate to chain member | From Charmander, click Charizard card | URL becomes `/pokemon/6`, page updates; same chain, Charizard now highlighted |
| US2.2 — current not clickable | Try clicking the highlighted card | No navigation, no reload |
| US2.5 — browser back | After navigating via chain, press Back | Return to the prior Pokémon's detail page |
| US3.1 — does not evolve | `/pokemon/128` (Tauros) or `/pokemon/151` (Mew) | "Evolution" heading visible; body reads "This Pokémon does not evolve." |
| US4.1 — branching | `/pokemon/134` (Vaporeon) | Eevee as root with 3 branches to Vaporeon (highlighted), Jolteon, Flareon |
| US4.3 — navigate sibling branch | From Vaporeon, click Jolteon | `/pokemon/135` with Jolteon highlighted; same branching chain |
| US5.1 — chain fetch fails | Simulate 500 on `/api/v2/evolution-chain/:id` | Detail page's hero/stats/abilities render normally; Evolution section shows scoped ErrorState with Retry |
| US5.3 — retry recovers | Click Retry after fixing the mock | Only the Evolution section refetches and populates; rest of page unchanged |
| Edge — Gen 1 truncation | `/pokemon/25` (Pikachu) | Chain shows Pikachu → Raichu with Pikachu as root (Pichu silently truncated) |
| Edge — reduced motion | OS reduced-motion setting enabled | No stage fade-in or edge-label fade-in animations |
| Trigger labels | Any chain | Linear arrows show "Lv. 16", "Fire Stone", "Trade", "Friendship" as appropriate |

## Run tests

```bash
npm test           # watch
npm run test:run   # CI
```

Required coverage before merge:
- Every component in `contracts/evolution-components.md` has a colocated test.
- `parseEvolutionChain` covers linear / branching / no-evolution / Gen-1-truncation.
- `formatEvolutionTrigger` covers level / stone / friendship / trade / unknown / empty.
- `getEvolutionChain` covers happy path, error, and per-stage sprite failures (graceful degradation).
- `DetailPage.test.tsx` gets 5 new integration cases (linear / branching / no-evolve / scoped error + retry / chain pending while detail loaded).
- `DetailPage.a11y.test.tsx` asserts zero axe violations on a loaded page including the chain.

## Visual review on `/preview`

Add entries for each new component:

- `EvolutionStage` — default / current / null spriteUrl placeholder / long name
- `EvolutionEdge` — unlabeled / labeled "Lv. 16" / labeled "Fire Stone" / labeled "Friendship" / horizontal / vertical
- `SkeletonEvolution` — static
- `EvolutionChain` — each of the 4 state variants (hard-coded fixture data for `/preview`)

## Where things live

- Spec: [spec.md](./spec.md)
- Plan: [plan.md](./plan.md)
- Research: [research.md](./research.md)
- Data model: [data-model.md](./data-model.md)
- Contracts: [contracts/](./contracts/)
- Parent scope: [../001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)
- Detail page (dependency): [../006-pokemon-detail/](../006-pokemon-detail/)
- Constitution: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
