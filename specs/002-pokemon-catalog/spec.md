# Feature Specification: Pokémon Catalog

**Feature Branch**: `002-pokemon-catalog`
**Created**: 2026-04-12
**Status**: Draft
**Parent Scope**: [specs/001-pokedex-mvp/spec.md](../001-pokedex-mvp/spec.md)
**Input**: User description: "Build the Pokémon Catalog: the home page that lets users discover any of the 151 Gen 1 Pokémon. Grid of 151 cards (sprite, name, National Dex ID, primary type badge), header search by partial name (case-insensitive) or exact National Dex ID (≤500ms, keyboard-navigable), type-filter chips with AND semantics + one-click reset, skeleton placeholders, empty states, and scroll position preservation when returning from a detail page."

> Cross-cutting requirements (performance targets, motion budget, accessibility, resilience, visual polish, standards conformance, PokeAPI as data source) are **inherited** from the parent scoping spec and are not repeated here.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the Full Roster (Priority: P1)

A visitor lands on the home page and sees the first page of Gen 1 Pokémon arranged as a responsive, visually rich grid of cards. Page controls let them advance through the roster one page at a time (or jump directly to a page number) until they've seen all 151. The page feels like a showcase the moment it loads.

**Why this priority**: This is the baseline catalog experience. Everything else in this feature (search, filter) only makes sense if the default paginated browse works first.

**Independent Test**: Load the home page on a fresh session. Verify the first page of cards renders within 2 seconds with each card showing sprite, name, National Dex ID, and at least one type badge. Advance through every page using the pagination controls and confirm all 151 Pokémon appear exactly once, in National Dex order.

**Acceptance Scenarios**:

1. **Given** a first-time visitor opens the home page, **When** the initial render completes, **Then** page 1 of the catalog displays within 2 seconds on broadband with cards in a responsive grid (columns adapt to viewport).
2. **Given** the grid is rendering, **When** card data or images are still loading, **Then** each slot shows a skeleton placeholder (not a broken layout or empty box) until replaced.
3. **Given** the user is on page 1, **When** they activate the "next page" control, **Then** the grid replaces its contents with the next batch of cards and the URL reflects the new page (so the page is shareable/bookmarkable).
4. **Given** the user walks every page, **When** they reach the final page, **Then** all 151 Pokémon have been shown exactly once in ascending National Dex order and "next page" is disabled on the last page.
5. **Given** the user clicks a card, **When** they return to the catalog from the detail page, **Then** they land on the same page they left from, with the grid scrolled back to the card they clicked.
6. **Given** the user opens a catalog URL that includes a page number directly, **When** the page loads, **Then** the grid displays that page's cards without requiring navigation from page 1.

---

### User Story 2 - Search by Name or ID (Priority: P1)

A user who already knows a Pokémon's name (e.g., "pikachu") or ID (e.g., "25" or "025") types into a header search input and sees the grid narrow to matching cards as they type.

**Why this priority**: Search is the single biggest usability win beyond browsing. Ranked P1 because the catalog is incomplete without it — finding a specific Pokémon in a 151-card grid by scroll alone is painful.

**Independent Test**: Focus the header search. Type "char" — within 500ms the grid shows only Charmander, Charmeleon, Charizard. Clear the input — the full grid returns. Type "150" — Mewtwo is the top/only match.

**Acceptance Scenarios**:

1. **Given** the search input is focused and empty, **When** the user types at least 2 characters of a name, **Then** the grid updates within 500ms to show only Pokémon whose name contains the query (case-insensitive substring match), paginated if the result set exceeds one page.
2. **Given** the user types a numeric value, **When** the value matches a valid National Dex ID in 1–151 (with or without leading zeros), **Then** that Pokémon appears as the match; other Pokémon are hidden.
3. **Given** the user has typed a query that produces results, **When** the search is active, **Then** pagination controls reflect the filtered result count (not the full 151).
4. **Given** search yields no matches, **When** results would be empty, **Then** the grid shows a helpful empty state (e.g., "No Pokémon match 'xyz'") with a clear way to reset the search.
5. **Given** the user is focused in the search input, **When** they press the down-arrow key, **Then** keyboard focus moves into the result grid; Enter activates the focused card.
6. **Given** the user clears the search input, **When** the query becomes empty, **Then** the catalog returns to page 1 of the full grid (subject to any active type filters).

---

### User Story 3 - Filter by Type (Priority: P2)

A user wants to browse only Pokémon of specific types (e.g., "all Fire types", or "Water and Ice duals"). They toggle one or more type-filter chips and the grid narrows to matching Pokémon.

**Why this priority**: Type-based exploration is a canonical Pokédex interaction. Ranked P2 because the catalog is usable without it (browse + search cover the essentials), but type discovery is a major quality-of-life improvement.

**Independent Test**: From the catalog, click the "Fire" chip — only Fire-type Gen 1 Pokémon appear. Add "Flying" — only Pokémon that are both Fire AND Flying appear (Charizard). Click reset — all filters clear and the full grid returns.

**Acceptance Scenarios**:

1. **Given** no filters are active, **When** the user clicks a single type chip, **Then** the grid shows only Pokémon whose types include that type (either primary or secondary), paginated if the filtered count exceeds one page, and the catalog returns to page 1 of the filtered set.
2. **Given** one filter is active, **When** the user activates a second filter chip, **Then** the grid shows only Pokémon whose types include **all** selected types (AND semantics) and resets to page 1 of the new result set.
3. **Given** one or more filters are active, **When** the user clicks the reset control, **Then** all filters clear in one action and the full grid is restored starting at page 1.
4. **Given** the active filter combination matches zero Pokémon, **When** the grid would be empty, **Then** an empty state explains the situation and offers a one-click reset.
5. **Given** both search and filters are active, **When** both apply, **Then** the grid shows Pokémon that match the search query AND all active type filters, paginated across the filtered result count.

---

### Edge Cases

- **Search with whitespace or special characters**: Input is trimmed; non-alphanumeric characters in name search fall back to the empty-state flow rather than returning stale results.
- **Search with leading zeros for IDs**: "025" and "25" both resolve to Pokémon #25.
- **Search matches neither name nor ID** (e.g., "xyz"): empty state shown; grid remains empty until query changes.
- **Filter chip for a type that no Gen 1 Pokémon carries** (e.g., Dark, Steel, Fairy — none exist in Gen 1): activating such a chip in combination with others returns zero matches; empty state offers reset. The chip itself is visible (type list is consistent across app) but disabled or visually muted if the user has no way to find a match with it.
- **Rapid typing**: Keystrokes debounced so the grid updates at most once per ≈150ms to keep scroll/paint smooth.
- **Back navigation from detail page**: If a search or filter was active and the user was on a specific page when they left, both the query/filters **and** the page number are preserved on return.
- **Direct URL to a page out of range** (e.g., page 99): The catalog redirects to the last valid page of the current result set (or page 1 when the set is empty).
- **Result set fits on one page**: Pagination controls are hidden or rendered in a disabled state; the reset control remains available when filters are active.
- **Very narrow viewport (≤ 320px)**: The grid collapses to a single column; the header search, type-filter row, and pagination control remain usable without horizontal scroll.

## Requirements *(mandatory)*

### Functional Requirements

**Grid**
- **FR-001**: System MUST display Gen 1 Pokémon in a responsive, paginated grid on the home page. The default page size is ~24 cards; exact value is a tunable implementation detail.
- **FR-002**: Each card MUST show sprite, name, National Dex ID, and the Pokémon's type badges (primary + secondary when present).
- **FR-003**: Cards MUST be rendered in ascending National Dex ID order by default (within and across pages).
- **FR-004**: Each card MUST be a single click/tap/Enter target that navigates to that Pokémon's detail page.
- **FR-005**: System MUST preserve both the catalog's current page and its scroll position within that page when the user returns from a detail page.

**Pagination**
- **FR-005a**: System MUST expose page-navigation controls: previous-page, next-page, and direct page selection (numbered pages or equivalent).
- **FR-005b**: The current page MUST be reflected in the URL (e.g., query param or path segment) so the page is shareable, bookmarkable, and survives browser refresh.
- **FR-005c**: Previous-page MUST be disabled on page 1; next-page MUST be disabled on the last page.
- **FR-005d**: Any change to search or filter state MUST reset the catalog to page 1 of the new result set.
- **FR-005e**: When the user opens a URL with a page number out of range, the catalog MUST clamp to the nearest valid page rather than showing an empty grid.

**Search**
- **FR-006**: The header MUST contain a single always-visible search input with an accessible label and a clear control.
- **FR-007**: The system MUST filter the grid by partial, case-insensitive substring match against the Pokémon name.
- **FR-008**: The system MUST also accept a numeric query and match against the National Dex ID, accepting optional leading zeros.
- **FR-009**: Search MUST update the grid within 500ms of the user pausing keystrokes (debounced to avoid excessive re-renders).
- **FR-010**: The search input MUST be keyboard-navigable: down-arrow moves focus into the grid; Enter on a focused card activates it.
- **FR-011**: Clearing the search input MUST restore the grid (subject to any active type filters).

**Type Filter**
- **FR-012**: The catalog MUST expose type-filter chips for all 18 Pokémon types in a consistent, recognizable palette.
- **FR-013**: Activating one chip MUST filter the grid to Pokémon whose type list includes that type.
- **FR-014**: Activating multiple chips MUST filter using AND semantics (Pokémon must carry **all** selected types).
- **FR-015**: Active chips MUST be visually distinguished from inactive chips.
- **FR-016**: A single one-click reset control MUST clear all active type filters at once.

**Combined search + filter**
- **FR-017**: When both search and filters are active, the grid MUST show only Pokémon that match the search query AND all active filters (intersection).

**Empty / loading states**
- **FR-018**: While data or images are loading, the grid MUST show skeleton placeholders occupying the same footprint as loaded cards.
- **FR-019**: When a search or filter combination returns zero results, the grid MUST display a user-friendly empty state with a prominent "reset" affordance.
- **FR-020**: If upstream data is unavailable on first load, the grid MUST show an error state with a retry control (per parent CC-004).

### Key Entities

- **Catalog Item**: A view-model for a single card in the grid. Attributes: Pokémon ID (1–151), name, primary + optional secondary type, sprite reference. Derived solely from data fetched via the PokeAPI client.
- **Catalog Query**: The combined view-model of the user's current discovery intent. Attributes: search string (may be empty), active type filter set (may be empty), current page number, page size, resulting filtered Pokémon ID list.
- **Page View Anchor**: A per-session record of the current page number and the catalog's vertical scroll offset within that page (or last-focused card), used to restore both when returning from a detail page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a first visit with a warm or cold cache, the first row of cards renders within 2 seconds on typical broadband.
- **SC-002**: 95% of search queries reflect their result in the grid within 500ms of the last keystroke.
- **SC-003**: A user who knows a Pokémon's name or ID can locate and open that Pokémon's detail page in under 15 seconds on first visit (search + direct click, no pagination needed in the common case).
- **SC-004**: Applying or clearing a type filter updates the grid in under 250ms (user perceives the change as instantaneous).
- **SC-005**: Returning from a detail page lands the user on the same page they left and within one viewport height of the card they clicked, 100% of the time within the same session.
- **SC-005a**: Navigating between catalog pages (previous / next / jump) updates the grid in under 250ms on a warm cache.
- **SC-006**: A keyboard-only user can reach any of the 151 Pokémon's detail pages using only Tab, Arrow keys, and Enter — zero mouse events required.
- **SC-007**: Zero critical accessibility violations (WCAG 2.1 AA) on automated audit of the catalog page.

## Assumptions

- The catalog is paginated with a default page size of ~24 cards (≈7 pages for the full 151-Pokémon roster). The exact page size is a tuning parameter and not a hard requirement; it should produce a visually balanced grid on common desktop and mobile viewports.
- Page state lives in the URL (e.g., `?page=3`) so pages are shareable and survive refresh.
- Type filter chips are always visible (no hidden drawer) because 18 chips fit in a wrap-row on desktop and horizontally scroll on mobile.
- Debounce window for search is ~150ms — small enough to feel instant, large enough to coalesce rapid keystrokes.
- National Dex ID search accepts plain integers (`25`, `025`); other numeric formats (`#025`, `No. 25`) are not supported.
- The type-filter palette uses the community-standard type colors tokenized per the project's design-tokens principle.
- Search semantics are substring-based, not prefix-based: typing "chu" matches "pikachu" and "raichu".
