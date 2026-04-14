# Implementation Plan: Evolution Chain

**Branch**: `007-evolution-chain` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from [specs/007-evolution-chain/spec.md](./spec.md)
**Parent Scope**: [specs/001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)
**Dependency**: Layers on top of the detail page ([specs/006-pokemon-detail/](../006-pokemon-detail/)). Assumes `getPokemonDetail`, `DetailPage`, `StatBar`, `AbilityList` and the existing `ErrorState` are available.

## Summary

Adds an "Evolution" section to the detail page, below the stats block. The section fetches the Pokémon's evolution chain from PokeAPI via the species → chain-URL hop, projects it into a flat list of stages + edges (trigger-labeled), filters any non-Gen-1 members out, and re-roots the chain so the first surviving Gen 1 Pokémon anchors the display. Stages render as compact clickable cards (sprite + name + `#NNN`), the current Pokémon gets a border + elevated shadow, arrows between stages carry short trigger labels ("Lv. 16", "Fire Stone"), and branching families like Eevee render as parallel paths from the common ancestor. Loading, error (scoped to the section), and "does not evolve" states each have their own variant. Horizontal on desktop, vertical on mobile. All of it honors the motion budget and WCAG 2.1 AA via the same conventions already used elsewhere.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x
**Primary Dependencies**: Vite, React Router v6 (existing; card click → `<Link to="/pokemon/:id">`), TanStack Query v5 (existing; new cache key `['evolution-chain', chainId]`)
**Storage**: PokeAPI upstream (read-only). Chain data is effectively static → 24h `staleTime` like other queries. No per-user persistence added by this feature.
**Testing**: Vitest + React Testing Library (colocated `<Component>.test.tsx`); MSW handlers extended for `/evolution-chain/:id` and the `evolution_chain.url` field on `/pokemon-species/:id`; `jest-axe` for the section's a11y smoke.
**Target Platform**: Evergreen browsers; responsive desktop + mobile web.
**Project Type**: Single-project SPA.
**Performance Goals**: Evolution section populated within 2s on warm cache (SC-001); section change on chain-member navigation ≤ 250ms perceived (inherited CC-001..006).
**Constraints**: Inherited from parent scope and constitution. New constraint specific to this feature: chain fetch is **independent** from the main detail fetch — a failure in one MUST NOT propagate to the other (FR-021, FR-022).
**Scale/Scope**: ~28 unique evolution chains touching Gen 1; longest chain is 3 stages; widest chain is Eevee with 3 sibling branches. Scope is purely additive — no changes to existing routes, services, or state management.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-Driven Architecture | ✅ PASS | New core components: `EvolutionChain`, `EvolutionStage`, `EvolutionEdge`, `SkeletonEvolution`. Page-level wiring stays in `src/pages/DetailPage/DetailPage.tsx`. |
| II. Design Tokens Over Hard-Coded Values | ✅ PASS | No new tokens introduced. Current-stage highlight reuses `--focus-ring` and `--shadow-lg`; edge labels use existing muted text tokens; card chrome inherits from the existing card pattern. |
| III. Test-First Development | ✅ PASS | `/speckit-tasks` will order each component's tests before its implementation. New service function + trigger-label formatter both get failing tests first. |
| IV. Spec-Driven Delivery | ✅ PASS | Pipeline: constitution v1.1.0 → parent 001 → spec 007 → this plan → tasks → implement. Clarify round already completed. |
| V. Standards Conformance | ✅ PASS | Colocated `.tsx` + `.css` + `.test.tsx` per the React Core Component Architecture standard; barrel export from `src/components/index.ts`; `/preview` entries for every variant. |
| VI. Modern Visual Polish | ✅ PASS | Stage cards reuse the existing card elevation treatment; arrow labels animate in with a ≤ 250 ms fade; branching layout uses CSS grid to keep paths visually parallel. All transitions wrapped by the global `prefers-reduced-motion` override. |

**Result**: All gates pass. No complexity justifications needed.

## Project Structure

### Documentation (this feature)

```text
specs/007-evolution-chain/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── evolution-service.md
│   └── evolution-components.md
├── checklists/
│   └── requirements.md
└── tasks.md              # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── index.ts
│   └── core/
│       ├── EvolutionChain/         # wraps layout + state machine for the section
│       ├── EvolutionStage/         # one card (clickable or current)
│       ├── EvolutionEdge/          # arrow + trigger label
│       ├── SkeletonEvolution/      # scoped skeleton placeholder
│       └── (existing ErrorState reused for scoped error)
├── pages/
│   └── DetailPage/
│       ├── DetailPage.tsx          # new <EvolutionChain chainId={...} /> section below stats
│       ├── DetailPage.css          # minor layout tweak for the new section slot
│       └── DetailPage.test.tsx     # extended with evolution-section integration cases
├── services/
│   └── pokeapi.ts                  # NEW: getEvolutionChain(id) + PokemonDetail gains evolutionChainId
├── utils/
│   ├── formatEvolutionTrigger.ts   # NEW: evolution_details → "Lv. 16" / "Fire Stone" / etc.
│   └── parseEvolutionChain.ts      # NEW: PokeAPI tree → flat Stages[] + Edges[] filtered to Gen 1
├── types/
│   └── pokemon.ts                  # extend with EvolutionChain, EvolutionStage, EvolutionEdge
├── test/
│   └── handlers/pokeapi.ts         # extend MSW with /evolution-chain/:id + species.evolution_chain.url
```

**Structure Decision**: Pure extension of feature 006. No new routes, no new state management, no new hooks. The detail page gains a bounded section below its stats; the service layer gains one new function and one augmented type; two utilities handle the two non-trivial data transformations (parse + trigger-format) so they can be unit-tested independently of React.

## Complexity Tracking

No constitution violations. Table intentionally empty.
