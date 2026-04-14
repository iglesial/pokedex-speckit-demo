# Feature Specification: Evolution Chain

**Feature Branch**: `007-evolution-chain`
**Created**: 2026-04-14
**Status**: Draft
**Parent Scope**: [specs/001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)
**Dependency**: Assumes the detail page ([specs/006-pokemon-detail/spec.md](../006-pokemon-detail/spec.md)) is in place — this feature adds a section to it.
**Input**: User description: "Evolution chain on the Pokémon detail page — below the stats section, add an 'Evolution' section that fetches the Pokémon's evolution chain and displays each stage as a mini Pokémon card, connected by arrow indicators showing the progression direction (left-to-right on desktop, top-to-bottom on mobile). Clicking any card in the chain navigates to that Pokémon's detail page. The current Pokémon is visually highlighted within the chain. Pokémon with no evolutions show a 'This Pokémon does not evolve' message. Handle branching evolutions (e.g., Eevee) by rendering each branch as a separate path from the common ancestor."

> Cross-cutting requirements (performance targets, motion budget, accessibility, resilience, visual polish, standards conformance, PokeAPI as data source, Gen 1 scope limit) are **inherited** from the parent scoping spec.

## Clarifications

### Session 2026-04-14

- Q: Should evolution arrows be labeled with the trigger (level / stone / friendship)? → A: Yes — each arrow displays its evolution trigger as a short label.
- Q: How is the current Pokémon visually highlighted in the chain? → A: Distinct border + elevated shadow using existing design tokens.
- Q: How to handle chains whose pre-evolutions are outside Gen 1 (e.g., Pichu → Pikachu → Raichu)? → A: Silent truncation — chain starts at the first Gen 1 member (Pikachu as root).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a Linear Evolution Path (Priority: P1)

A user viewing a detail page for a Pokémon that evolves in a straight line (e.g., Bulbasaur → Ivysaur → Venusaur, Charmander → Charmeleon → Charizard, Pikachu → Raichu) sees an "Evolution" section below the base-stat bars. The section shows each stage as a compact card (sprite, name, National Dex ID), connected by arrow indicators that point in the direction of progression — horizontal on desktop, vertical on mobile. The stage the user is currently viewing is visually highlighted so it's clear where they are in the chain.

**Why this priority**: Evolutions are a defining concept in the franchise and the single most-expected feature of a detail page beyond stats. Without it the detail page feels incomplete for users who know Pokémon.

**Independent Test**: Open `/pokemon/4` (Charmander). Below the stats section, see three stages — Charmander, Charmeleon, Charizard — in that order, each with its own sprite, name, and `#NNN` ID. An arrow points from Charmander to Charmeleon and from Charmeleon to Charizard. Charmander is visually distinguished as the current Pokémon.

**Acceptance Scenarios**:

1. **Given** the user is on a detail page for a Pokémon with a linear chain, **When** the chain data loads, **Then** the Evolution section renders each member of the chain in order, with sprite/name/ID and arrow indicators between stages.
2. **Given** the chain is rendered, **When** the user identifies the current Pokémon in the chain, **Then** that stage is visually highlighted (e.g., a distinct border, shadow, or background) compared to the other stages.
3. **Given** the user is on a wide viewport (desktop), **When** the Evolution section renders, **Then** the chain is laid out horizontally with arrows pointing from left to right.
4. **Given** the user is on a narrow viewport (mobile), **When** the Evolution section renders, **Then** the chain is laid out vertically with arrows pointing top to bottom.

---

### User Story 2 - Navigate Between Chain Members (Priority: P1)

From within the Evolution section, the user can click or tap (or activate via keyboard) any stage other than the current one to navigate directly to that Pokémon's detail page. Navigation uses the same routing as any catalog-to-detail jump, so browser back and the in-page BackButton still work.

**Why this priority**: Cross-navigation through evolutions is a core Pokédex interaction pattern. A static visualization without navigation is half the feature.

**Independent Test**: On Charmander's detail page, click the Charizard card in the Evolution section. The URL becomes `/pokemon/6` and the detail page updates to Charizard. Charizard is now the highlighted stage in the same chain. Clicking back returns to Charmander with its own highlighted stage.

**Acceptance Scenarios**:

1. **Given** the chain is rendered, **When** the user clicks a stage other than the current Pokémon, **Then** the app navigates to that Pokémon's detail page.
2. **Given** the user clicks the currently highlighted stage, **When** the click is handled, **Then** nothing happens (no reload, no navigation) — it is not a link to itself.
3. **Given** the user navigates to another member of the chain, **When** that new detail page renders, **Then** the Evolution section shows the same chain with the new current Pokémon highlighted.
4. **Given** the user uses only the keyboard, **When** they Tab through the Evolution section, **Then** each non-current stage is reachable and activating it with Enter triggers the same navigation.
5. **Given** the user navigated from Charmander → Charizard via the chain, **When** they press the BackButton or browser back, **Then** they return to Charmander's detail page.

---

### User Story 3 - Handle Pokémon That Don't Evolve (Priority: P2)

Some Pokémon have no evolutions at all (e.g., Tauros, Lapras, Aerodactyl, Mew). For these the Evolution section still renders below the stats — it doesn't disappear — but with a short, clear message: "This Pokémon does not evolve." No stages, no arrows.

**Why this priority**: A Pokémon with no evolutions is a legitimate category that roughly 20% of Gen 1 falls into. Silently omitting the section would confuse users expecting consistency; an empty area would look broken.

**Independent Test**: Open `/pokemon/128` (Tauros) or `/pokemon/151` (Mew). Below the stats, the Evolution section is still present. It contains the message "This Pokémon does not evolve." No cards or arrows render.

**Acceptance Scenarios**:

1. **Given** the Pokémon's chain contains only itself (no further evolutions, no prior forms), **When** the detail page renders, **Then** the Evolution section heading is visible and the content reads "This Pokémon does not evolve."
2. **Given** the "does not evolve" state is shown, **When** the user reads the section, **Then** no card or arrow elements are present.

---

### User Story 4 - Render Branching Evolutions (Priority: P2)

Some chains branch — Eevee evolves into Vaporeon, Jolteon, or Flareon (three branches in Gen 1). The Evolution section must make the branching visible: one common ancestor followed by multiple parallel paths. A user opening Vaporeon's detail page sees Eevee as the common ancestor, arrows to Vaporeon (its current form), Jolteon, and Flareon as siblings. Only the current Pokémon's stage is highlighted.

**Why this priority**: Branching is rare in Gen 1 (only Eevee and a couple of stone-specific cases like Vulpix/Ninetales are simple linear, so Eevee is the main multi-branch example). Rendering it incorrectly — showing only one branch, or showing branches as a linear list — actively misleads users. Ranked P2 because it affects a small number of species; without it the rest of the feature still works.

**Independent Test**: Open `/pokemon/134` (Vaporeon). The Evolution section shows Eevee as the root, with three distinct paths branching out to Vaporeon, Jolteon, and Flareon. Vaporeon is highlighted; Eevee, Jolteon, and Flareon are shown as siblings of the current path. Clicking Jolteon navigates to `/pokemon/135` and shows the same chain with Jolteon now highlighted.

**Acceptance Scenarios**:

1. **Given** a Pokémon belongs to a branching chain, **When** the detail page renders, **Then** the common ancestor is shown once and each evolutionary branch is rendered as a separate path from it.
2. **Given** the current Pokémon is on one of multiple branches, **When** the chain is rendered, **Then** only the current Pokémon's stage is highlighted — the sibling branches are rendered but not highlighted.
3. **Given** the user clicks a sibling branch (e.g., from Vaporeon's page clicks Jolteon), **When** the app navigates, **Then** the new detail page shows the same chain with the clicked Pokémon highlighted.

---

### User Story 5 - Handle Upstream Failures for the Chain (Priority: P3)

The Evolution section depends on a separate upstream call beyond the main detail fetch. If that call fails (network error, rate limit, or the chain is unavailable), the section must fail gracefully without blocking the rest of the detail page.

**Why this priority**: Resilience. The detail page's main content (stats, abilities, flavor text) is already usable without the chain; a failure in the chain shouldn't cascade. Ranked P3 because in practice PokeAPI is reliable — this is defensive coverage.

**Independent Test**: Simulate a failed chain fetch for any Pokémon. The detail page still renders completely (hero, stats, abilities, flavor text). The Evolution section shows a small inline error state with a retry affordance. Activating retry re-fetches the chain only; success updates just the Evolution section.

**Acceptance Scenarios**:

1. **Given** the main detail fetch succeeds but the chain fetch fails, **When** the page renders, **Then** the rest of the page is fully usable and only the Evolution section shows an error state.
2. **Given** the chain section shows an error with a retry control, **When** the user activates retry, **Then** only the chain is re-fetched; the rest of the page is not reloaded.
3. **Given** a retry succeeds, **When** the chain data arrives, **Then** the error state is replaced by the normal chain rendering.

---

### Edge Cases

- **Gen 1 scope truncation**: Chains whose canonical members include non-Gen-1 Pokémon (e.g., Pichu at #172 as Pikachu's pre-evolution) are silently truncated. The chain starts at the first Gen 1 member — for Pikachu, it reads Pikachu → Raichu with Pikachu as the root. No placeholder, ellipsis, or hint of the removed ancestor is shown.
- **Evolution with identical sprite art** (rare): Each stage MUST still render as its own card — no deduplication by visual.
- **Very long chains** (no Gen 1 chain exceeds 3 stages, but defensive): the layout must remain readable; horizontal scroll is acceptable on extreme narrow viewports.
- **Chain loads slower than the main detail data**: the Evolution section MUST show a skeleton placeholder of roughly the correct height so the page doesn't jump when the chain arrives.
- **Navigation to a chain member that is itself out-of-range**: not possible if filter is correctly applied, but as a defensive measure the card MUST NOT be rendered at all rather than rendered and broken.
- **Reduced-motion**: any arrow/chain entry animation MUST be disabled or minimized per the project's motion policy.
- **Keyboard focus movement during chain navigation**: when the user activates a chain member and lands on the new detail page, focus SHOULD land somewhere predictable (e.g., the page heading or the newly-highlighted chain card), not reset to the document root.

## Requirements *(mandatory)*

### Functional Requirements

**Section Placement & Structure**
- **FR-001**: An "Evolution" section MUST be rendered on every detail page, positioned directly below the base-stats section.
- **FR-002**: The section MUST always render — it is not conditionally hidden — so that users get consistent page structure across Pokémon.
- **FR-003**: The section heading MUST be visually consistent with other detail-page section headings (same typography, spacing).

**Chain Rendering**
- **FR-004**: For a Pokémon with evolutions, the section MUST render each member of the evolution chain as a compact card showing sprite, name (title-cased), and National Dex ID (`#NNN` format).
- **FR-005**: Consecutive stages MUST be connected by arrow indicators pointing in the direction of evolutionary progression.
- **FR-005a**: Each arrow MUST be labeled with the condition that triggers the evolution, in a short human-readable form (e.g., `Lv. 16`, `Fire Stone`, `Friendship`, `Trade`). When a trigger has multiple requirements (e.g., level + held item), the label MUST convey the essential condition without becoming multi-line on desktop.
- **FR-005b**: When the trigger cannot be determined or is genuinely unavailable from the data source, the arrow MUST still render, with its label omitted rather than showing a placeholder like "unknown".
- **FR-006**: On wide viewports (desktop), arrows MUST be oriented horizontally (left to right).
- **FR-007**: On narrow viewports (mobile), the chain MUST stack vertically with arrows oriented top to bottom.
- **FR-008**: The card representing the current Pokémon (matching the detail page's `:id`) MUST be visually highlighted with a distinct border and elevated shadow (both sourced from existing design tokens — no new palette entries). The highlight MUST be clearly distinguishable from hover/focus states of sibling cards so the three states do not collide visually.
- **FR-009**: The current Pokémon's card MUST NOT be clickable (or, if technically clickable, MUST NOT navigate away from the current page).

**Branching**
- **FR-010**: For chains with branching evolutions, the common ancestor MUST be rendered once, with each branch rendered as a separate path leading from it.
- **FR-011**: Sibling branches MUST be visually identifiable as parallel — not as a linear continuation of one another.
- **FR-012**: When the current Pokémon is on one of multiple branches, only the current Pokémon MUST be highlighted; sibling-branch members MUST be rendered in the un-highlighted state.

**Navigation**
- **FR-013**: Each non-current chain member MUST be a clickable/tappable navigation target that opens that Pokémon's detail page.
- **FR-014**: Chain-member navigation MUST use the same routing contract as catalog-to-detail navigation so that browser back, the in-page back control, and history semantics behave identically.
- **FR-015**: After navigating to a new chain member, the Evolution section on the new page MUST show the same chain with the new current Pokémon highlighted.
- **FR-016**: Each navigable chain member MUST be reachable and activatable via keyboard (Tab to focus, Enter or Space to activate).

**No-Evolution State**
- **FR-017**: For a Pokémon whose chain contains only itself, the Evolution section MUST display the message "This Pokémon does not evolve." No cards or arrows are rendered.
- **FR-018**: The no-evolution state MUST occupy comparable visual space to a populated chain to avoid layout shift between Pokémon.

**Gen 1 Scope**
- **FR-019**: Chains MUST be filtered to include only Pokémon with National Dex IDs in the range 1–151. Non-Gen-1 members MUST be silently truncated — no placeholder, no stub, no ellipsis indicating their former presence. The chain MUST reroot at the first remaining Gen 1 member (e.g., Pikachu's chain renders as Pikachu → Raichu, with Pikachu as the root).
- **FR-019a**: If a truncation removes the connecting edge to a Gen 1 member — for example if a Gen 2 pre-evolution is the only path into a Gen 1 Pokémon — the remaining Gen 1 member(s) MUST still render as a well-formed chain (possibly with only one stage if that's what's left), never as "does not evolve" merely because an out-of-scope member was removed.

**Loading / Error States**
- **FR-020**: While chain data is loading, the Evolution section MUST show a skeleton placeholder of approximately the same height as the loaded state to avoid layout shift.
- **FR-021**: If the chain fetch fails, the Evolution section MUST show a scoped error state with a retry affordance; the rest of the detail page MUST remain fully usable.
- **FR-022**: Activating the retry affordance MUST re-fetch only the chain; it MUST NOT re-fetch or re-render other sections of the detail page.

**Accessibility**
- **FR-023**: Chain-member cards MUST have accessible names (Pokémon name + ID) so screen readers announce each link meaningfully.
- **FR-024**: The current Pokémon's card MUST indicate its current-ness to assistive technology (e.g., an `aria-current` attribute or equivalent), not only visually.
- **FR-025**: The loading and error states MUST announce themselves to assistive technology (via appropriate live regions or roles).

### Key Entities

- **Evolution Chain**: An ordered, possibly-branching structure describing which Pokémon evolve into which. Each node is a Pokémon reference; each edge indicates "evolves into" and carries the evolution trigger. In scope: trimmed to Gen 1 members only.
- **Chain Member (Stage)**: A single Pokémon's position within a chain. Attributes: Pokémon ID, name, sprite, is-current flag.
- **Evolution Edge**: A connection from one stage to another. Attributes: source Pokémon ID, target Pokémon ID, trigger label (derived from the evolution details, e.g., "Lv. 16", "Fire Stone", "Friendship").
- **Chain Section State**: Transient UI state — "loading" | "loaded" | "no-evolutions" | "error" — determining what variant renders within the Evolution section.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a first visit to a detail page with a warm cache, the Evolution section is fully populated within 2 seconds.
- **SC-002**: A user landing on any Pokémon's detail page can identify themselves in the chain (find the highlighted stage) within 3 seconds.
- **SC-003**: 100% of Gen 1 Pokémon with evolutions display their chain correctly (linear or branching), verified against a canonical list.
- **SC-004**: 100% of Gen 1 Pokémon without evolutions display the "does not evolve" message instead of an empty section.
- **SC-005**: Navigating through the chain (click a stage → land on its detail page) works 100% of the time for every non-current chain member, with browser back returning to the prior page.
- **SC-006**: On a simulated chain-fetch failure, the rest of the detail page remains fully interactive (navigation, back button, retry of main detail, etc.), verified by walk-through.
- **SC-007**: Zero critical WCAG 2.1 AA violations on automated audit of the Evolution section in all four states (loading, loaded linear, loaded branching, error, no-evolution).

## Assumptions

- The detail page (feature 006) is in place; this feature adds a new section to it.
- The upstream data source exposes the evolution chain via a separate call keyed by a chain identifier retrievable from the Pokémon's species record. Chain data is considered stable and can be cached with the same aggressive client-side strategy used elsewhere.
- The current-Pokémon highlight is achieved via a distinct border and elevated shadow, both from existing tokens (`--focus-ring` or equivalent accent; `--shadow-lg`). No new tokens are introduced by this feature.
- Arrow indicators are a visual/semantic affordance; their trigger labels are plain text rendered alongside the arrow. Labels MUST be readable by screen readers (they're content, not decoration), so the arrow's accessible name reads like "evolves at level 16".
- The Eevee family is the only meaningful branching chain in Gen 1. Other multi-branch chains introduced in later generations are out of scope thanks to the 1–151 ID filter.
- The "no evolutions" copy is a single sentence; tone is consistent with the rest of the app (friendly, factual).
- Chain loading is *independent* from the main detail fetch — a failure in one does not block the other.
