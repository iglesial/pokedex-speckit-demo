<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: Added new principle VI (Modern Visual Polish) to elevate UX/"wow effect" as a
first-class, testable expectation. MINOR bump per governance rule (new principle added).

Modified principles: none renamed

Added principles:
  - VI. Modern Visual Polish

Added sections: none

Removed sections: none

Templates requiring updates:
  - .specify/templates/plan-template.md — ⚠ pending (Constitution Check should cover principle VI)
  - .specify/templates/spec-template.md — ⚠ pending (spec acceptance criteria should permit UX polish items)
  - .specify/templates/tasks-template.md — ⚠ pending (polish/animation tasks should be representable)
  - README.md — ⚠ pending (no runtime guidance doc yet)

Follow-up TODOs: none
-->

# Pokedex SpecKit Demo Constitution

## Core Principles

### I. Component-Driven Architecture

Reusable UI lives in `src/components/core/` with component file, CSS file, and test file colocated in
the same directory. Each core component MUST export a typed Props interface (extending native HTML
attributes when applicable) and be re-exported from the barrel `src/components/index.ts`. The `src/`
tree MUST remain organized by responsibility (`components/`, `pages/`, `services/`, `hooks/`,
`contexts/`, `types/`, `utils/`, `config/`, `test/`).

Rationale: Colocation and predictable structure make components discoverable, testable, and safe to
refactor without hunting across the tree.

### II. Design Tokens Over Hard-Coded Values

All color, spacing, shadow, and radius tokens MUST be declared as CSS custom properties in
`src/index.css` and referenced via `var(--token-name)` from component CSS. Hard-coded visual values
in component styles are prohibited. Class name composition MUST use an array filtered by `Boolean`,
never ad-hoc string concatenation.

Rationale: Centralized tokens enable consistent theming and future theme swaps without component
rewrites; disciplined class composition avoids whitespace/falsy-value bugs.

### III. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written before implementation for every new component, hook, service, or behavior.
Unit tests use Vitest + Testing Library and are colocated as `<Component>.test.tsx`. The Red → Green
→ Refactor cycle is mandatory: a failing test MUST exist and be reviewed before the implementing code
is merged.

Rationale: Test-first keeps design honest, surfaces contract gaps early, and prevents the erosion
typical of demo projects accumulating untested UI.

### IV. Spec-Driven Delivery

Feature work MUST flow through the spec-kit pipeline: `/speckit-constitution` →
`/speckit-specify` → `/speckit-clarify` (when ambiguities exist) → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement`. Specifications and plans MUST exist and be committed
before implementation begins. Ad-hoc features that bypass the pipeline are not permitted on `main`.

Rationale: The pipeline enforces traceability from intent to code and makes review surfaces explicit.

### V. Standards Conformance

Every PR MUST comply with the Packmind standards installed under `.packmind/standards/` and
mirrored to `.claude/rules/packmind/`. When a standard and this constitution conflict, the
constitution wins and the discrepancy MUST be raised as an amendment. New standards adopted via
`packmind-cli install` become binding on merge.

Rationale: Packmind standards encode team conventions; treating them as first-class rules keeps the
demo aligned with the broader organization's practices.

### VI. Modern Visual Polish

The product MUST deliver a "wow effect" on first impression. This means: a contemporary visual
language (generous spacing, expressive typography, layered depth via shadow/elevation tokens),
smooth micro-interactions (hover, focus, and state transitions ≤ 250ms using CSS transitions or
`prefers-reduced-motion`-aware animations), and deliberate motion on entry for hero elements (e.g.,
Pokémon card reveals). Designs MUST feel current — no default browser chrome, no unstyled form
elements, no flat-gray placeholder aesthetics. Every new screen MUST be reviewed against the
`/preview` route and a "delight checklist" (motion, depth, typographic hierarchy, responsive
behavior, dark-mode readiness) before merge.

Rationale: A Pokédex is inherently a showcase surface; a merely functional UI undersells the demo.
Encoding polish as a principle prevents it from being deprioritized under delivery pressure.

## Tech Stack & Structure Constraints

- Frontend stack: React + TypeScript + Vite. New scaffolding MUST use
  `npm create vite@latest <name> -- --template react-ts`.
- A dev-only `/preview` route MUST render every core component with all variant combinations; it is
  the single source of truth for visual review.
- Testing stack is fixed: Vitest + Testing Library. Alternative runners require an amendment.
- No runtime dependency additions without justification in the feature plan's Complexity section.

## Development Workflow & Quality Gates

- All changes land via PR. Direct pushes to `main` are prohibited.
- CI MUST pass lint, type-check, and the full Vitest suite before merge.
- Each PR description MUST list the constitution principles touched and confirm compliance, or flag
  deviations with rationale.
- Spec-kit extension hooks (see `.specify/extensions.yml`) drive the commit cadence; auto-commit
  prompts SHOULD be accepted unless the working tree is intentionally staged.

## Governance

This constitution supersedes ad-hoc practices, informal conventions, and individual preferences.
Amendments require:

1. A PR modifying `.specify/memory/constitution.md` with a Sync Impact Report.
2. Explicit version bump per semantic versioning:
   - **MAJOR**: backward-incompatible removal or redefinition of a principle or governance rule.
   - **MINOR**: new principle or materially expanded section.
   - **PATCH**: clarifications, wording, or non-semantic refinements.
3. Synchronized updates to dependent templates (`plan-template.md`, `spec-template.md`,
   `tasks-template.md`) when principles they reference change.
4. Review approval from at least one maintainer.

All PRs and reviews MUST verify compliance with these principles. Added complexity MUST be
justified. Runtime development guidance lives alongside the spec-kit templates in `.specify/`.

**Version**: 1.1.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
