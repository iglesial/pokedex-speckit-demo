# Feature Specification: Pokémon Detail Page

**Feature Branch**: `006-pokemon-detail`
**Created**: 2026-04-13
**Status**: Draft
**Parent Scope**: [specs/001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)
**Input**: User description: "Build the Pokémon Detail Page: the per-Pokémon profile route /pokemon/:id for any of the 151 Gen 1 Pokémon. Artwork with entry motion, name and ID, types, base stats as bars, height/weight, abilities (hidden flagged), English flavor text, back control restoring catalog page+scroll, skeletons while loading, error with retry, friendly 404 for out-of-range IDs."

> Cross-cutting requirements (performance targets, motion budget, accessibility, resilience, visual polish, standards conformance, PokeAPI as data source) are **inherited** from the parent scoping spec and are not repeated here.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View a Pokémon's Profile (Priority: P1)

A user lands on a Pokémon's detail page — either by clicking a card in the catalog or by opening a direct URL like `/pokemon/6`. The page presents the full story of that Pokémon: large official artwork that slides into view, the name and National Dex ID, type badges, all six base stats as comparable bars, height and weight in familiar units, the abilities list (with any hidden ability visually distinguished), and an English flavor-text description. The page feels alive and considered — the "wow effect" continues from the catalog.

**Why this priority**: This is the page. Without it, clicking a card in the catalog goes nowhere, and every downstream feature (evolution chains, favorites on detail, shiny on detail) has no host.

**Independent Test**: Open `/pokemon/6` on a fresh session. Within 2 seconds see Charizard's artwork, name, `#006` ID, Fire + Flying type badges, six stat bars, height/weight, abilities (including any hidden ability flagged), and at least one English flavor-text entry.

**Acceptance Scenarios**:

1. **Given** the user clicks a catalog card, **When** the detail page finishes loading, **Then** the page shows artwork, name (title-cased), `#NNN`-formatted ID, all types, base stats as proportional bars, height, weight, abilities, and one English flavor-text entry.
2. **Given** the user opens `/pokemon/6` via direct URL, **When** the page loads, **Then** it renders exactly the same content as if they had clicked Charizard from the catalog.
3. **Given** the artwork and detail data are loading, **When** the page first renders, **Then** skeleton placeholders cover each section (artwork area, stats rows, text block) so the layout does not visibly shift when data arrives.
4. **Given** the data has loaded, **When** the artwork first appears, **Then** it animates into view (subtle scale + fade) with the motion budget honoring `prefers-reduced-motion`.
5. **Given** a Pokémon has a hidden ability, **When** the abilities section renders, **Then** the hidden ability is visually distinguished from its regular abilities (e.g., a "Hidden" label or muted styling).
6. **Given** English flavor text for the Pokémon is unavailable, **When** the page renders, **Then** the flavor-text area is omitted gracefully — no broken layout, no placeholder string.

---

### User Story 2 - Return to the Catalog Where I Left Off (Priority: P1)

A user who opened a detail page from the catalog wants to go back to exactly where they were — same catalog page, same scroll position, same search/filter context — without hunting. A visible back control at the top of the detail page, the browser back button, and the keyboard (Backspace/Alt+Left by platform norm) all produce the same return.

**Why this priority**: Return navigation is half of a detail page's value. If a back-nav loses the user's place in a 151-card list, exploration becomes frustrating.

**Independent Test**: From the catalog on page 3 (after applying a type filter), click any card → click the back control on the detail page → land on catalog page 3 with the same filter active, scrolled to the card you clicked.

**Acceptance Scenarios**:

1. **Given** the user arrived at the detail page from the catalog, **When** they activate the visible back control, **Then** they return to the catalog at the same page, the same search/filter state, and scrolled to the card they left from.
2. **Given** the user used the browser back button instead of the in-page control, **When** the browser navigates back, **Then** the same restoration behavior applies.
3. **Given** the user deep-linked directly to `/pokemon/:id` without visiting the catalog first, **When** they activate the back control, **Then** they land on the catalog home (`/`) with default state.
4. **Given** the user is on the detail page, **When** they tab to the back control, **Then** it is keyboard-reachable and has a clear focus state.

---

### User Story 3 - Handle Out-of-Range and Failed Requests Gracefully (Priority: P2)

A user might bookmark, mistype, or share a URL like `/pokemon/0`, `/pokemon/152`, `/pokemon/abc`, or arrive when PokeAPI is temporarily unreachable. The page must tell them clearly what happened and how to recover — never a blank screen or a raw error.

**Why this priority**: Real-world robustness. Errors are rare in the happy path, but when they happen a bad UX here damages trust in the whole app. Ranked P2 because the happy path (US1 + US2) must work first.

**Independent Test**: Open `/pokemon/999` → "not found" state with a "Back to catalog" action. Simulate a network failure on `/pokemon/25` → error state with a "Retry" action that succeeds on retry.

**Acceptance Scenarios**:

1. **Given** the URL's ID is outside the MVP range (not in 1–151) or non-numeric, **When** the page renders, **Then** a friendly "not found" state explains the situation and offers a clear link back to the catalog.
2. **Given** the upstream fetch for a valid ID fails, **When** the page renders, **Then** an error state with a retry control appears; activating retry re-fetches and renders the Pokémon on success.
3. **Given** the user is on an error or not-found state, **When** they activate the back control or catalog link, **Then** they arrive at the catalog (`/`).

---

### Edge Cases

- **ID formatting in URL**: `/pokemon/6`, `/pokemon/006`, `/pokemon/0006` all resolve to Charizard (leading zeros tolerated).
- **Very long flavor text**: rendered in its entirety; the layout does not clip or truncate the artwork or stats to make room.
- **Pokémon with exactly one type** (e.g., Pikachu): only one type badge is shown; no empty slot.
- **Pokémon with no hidden ability**: abilities list renders without a "hidden" subsection or label.
- **Flavor text contains non-breaking spaces / form-feed characters** (PokeAPI quirk): these are normalized to regular spaces before rendering.
- **Narrow viewport (≤ 375 px)**: artwork, stats, and text stack vertically; every interactive control remains tap-reachable.
- **Reduced-motion preference**: the artwork entry animation and any transitions are disabled or minimized.
- **Rapid navigation**: if the user opens a detail page then immediately clicks back before data loads, in-flight requests do not cause stale updates on the catalog.

## Requirements *(mandatory)*

### Functional Requirements

**Page Content**
- **FR-001**: The page MUST render at route `/pokemon/:id` for any ID in the Gen 1 range (1–151), including IDs supplied with leading zeros.
- **FR-002**: The page MUST display the Pokémon's official artwork as the primary visual, with the image area visible even before the image has loaded.
- **FR-003**: The page MUST display the Pokémon's name (title-cased) and `#NNN`-formatted National Dex ID.
- **FR-004**: The page MUST display all of the Pokémon's types as badges, using the same tokenized palette as the catalog.
- **FR-005**: The page MUST display the six base stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed), each as a labeled visual bar whose length is proportional to the stat value relative to a shared maximum.
- **FR-006**: The page MUST display the Pokémon's height and weight in human-readable units (meters + centimeters; kilograms).
- **FR-007**: The page MUST display the full abilities list; any ability flagged as "hidden" MUST be visually distinguished from regular abilities.
- **FR-008**: The page MUST display at least one English flavor-text entry when available, with PokeAPI's whitespace quirks normalized. When no English entry exists, the flavor-text section MUST be omitted rather than showing an empty block.

**Motion & Polish**
- **FR-009**: When artwork becomes visible after loading, it MUST animate into view (entry motion — e.g., subtle scale + fade). The animation MUST be disabled or minimized when `prefers-reduced-motion: reduce` is set.
- **FR-010**: All transitions on the page MUST respect the project's motion budget (inherited from the parent scope's cross-cutting requirements).

**Navigation & Back Control**
- **FR-011**: The page MUST render a visible, keyboard-reachable back control that returns the user to the catalog.
- **FR-012**: Activating the back control, the browser back button, or the platform-native back gesture MUST produce the same result: return to the catalog at the same page and scroll position, with the same search/filter state that was active on departure.
- **FR-013**: If the user deep-linked to the detail page (no prior catalog visit in this session), the back control MUST take them to the catalog home (`/`) with default state.

**Loading, Empty, and Error States**
- **FR-014**: While data is loading, each content area (artwork, title block, type badges, stats, height/weight, abilities, flavor text) MUST show a skeleton placeholder of the correct shape so the final layout does not shift.
- **FR-015**: If the upstream fetch for a valid in-range ID fails, the page MUST display an error state with a retry control; activating retry MUST re-attempt the fetch.
- **FR-016**: If the URL's ID is outside the Gen 1 range (not 1–151), non-numeric, or otherwise invalid, the page MUST display a friendly "not found" state including a clear affordance back to the catalog.
- **FR-017**: Error, not-found, and loading states MUST all be keyboard-reachable and announce themselves to assistive technology (e.g., via an appropriate live region or role).

### Key Entities

- **Pokémon Profile**: The view-model for the detail page. Attributes: National Dex ID, name, types, sprites (default artwork + any fallbacks), base stats (six values), height, weight, abilities (each with name + hidden flag), flavor text (most-recent English entry).
- **Return Context**: The catalog state (page number, search query, active type filters, scroll position, last-focused card) captured when the user leaves the catalog for a detail page. Used to restore position on return.
- **Detail Page State**: Transient UI state — "loading" | "loaded" | "error" | "not-found" — that determines which layout variant renders.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a first visit to any valid detail URL with a warm cache, the artwork and title appear within 2 seconds.
- **SC-002**: 100% of the time, returning to the catalog via the back control restores the user to the same page and within one viewport height of the card they left from (same session).
- **SC-003**: Users can identify a Pokémon's two strongest stats at a glance (≤ 3 seconds) thanks to the visual bars — verified in qualitative review.
- **SC-004**: Opening any out-of-range or invalid detail URL results in a recognizable "not found" state within 1 second, and the user can return to the catalog with a single action.
- **SC-005**: When a simulated upstream failure happens, clicking retry recovers the page on the next successful fetch 100% of the time, without a hard reload.
- **SC-006**: Zero critical WCAG 2.1 AA violations on automated audit of the loaded detail page.
- **SC-007**: In a first-impression survey of the detail page, ≥ 70% of participants describe it as "polished", "modern", or equivalent (carrying the constitution's wow-effect principle onto this surface).

## Assumptions

- The detail page is a separate route from the catalog; navigating to it pushes a history entry so browser back-nav works naturally.
- "Primary" artwork means PokeAPI's `official-artwork` default sprite; if unavailable, fall back to the default front sprite, then to a neutral placeholder — never a broken image icon.
- Flavor text is selected as the most recent English entry; earlier entries are ignored for MVP.
- Stat bars use a shared maximum of 255 (PokeAPI's theoretical cap) so bars are comparable across Pokémon.
- Height and weight are rendered as "X.X m" / "X.X kg"; imperial units are out of scope for MVP.
- The detail page does not include evolution chains, favorites, or shiny toggles — those live in separate child features (004, 005, 006 of the MVP scope).
