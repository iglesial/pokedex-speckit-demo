# Research: Pokémon Catalog

**Feature**: 002-pokemon-catalog
**Date**: 2026-04-12

All technical unknowns resolved from the constitution, the `react-core-component-architecture` standard, the parent scoping spec, and established React SPA patterns. No `NEEDS CLARIFICATION` markers remain.

## Decisions

### 1. Pagination model: URL-resident page number, client-side slicing

- **Decision**: Store the current page in the URL as a query parameter (`?page=3`). The grid fetches the full 151-summary list once and slices it client-side per `PAGE_SIZE`.
- **Rationale**: The result set is small (151 items) and static; slicing client-side is trivially fast (SC-005a <250ms), makes search/filter composition straightforward, and avoids extra PokeAPI round-trips per page change. URL state means pages are shareable (FR-005b) and natural browser back/forward work.
- **Alternatives considered**: Server-backed pagination with `?limit&offset` on PokeAPI (rejected — extra requests per page, cache fragmentation); React state only (rejected — breaks FR-005b shareability and refresh persistence).

### 2. Page size: 24 cards (6×4 on desktop, responsive down to 1 column)

- **Decision**: `PAGE_SIZE = 24`. Yields 7 pages for 151 Pokémon (last page has 7 cards).
- **Rationale**: 24 divides evenly into common responsive grid column counts (2/3/4/6), keeping the final row full on most viewports. Gives ≈7 pages — enough that pagination feels useful, few enough that a user isn't "paginating forever".
- **Alternatives considered**: 20 (8 pages; uneven on 6-column grids), 30 (6 pages; too dense on mobile), 12 (13 pages; too chatty).

### 3. URL contract: `/?q=char&types=fire,flying&page=3`

- **Decision**: Three query parameters — `q` (string, empty omitted), `types` (comma-separated lowercase enum, empty omitted), `page` (integer ≥ 1, default omitted). Omitted parameters mean "default".
- **Rationale**: Human-readable, trivially shareable, round-trips through `URLSearchParams`. Lets users bookmark specific discovery intents.
- **Alternatives considered**: Hash-based state (rejected — worse for sharing/analytics); server-routed path segments (rejected — overkill for an SPA).

### 4. Data fetching: single `listGen1Summaries()` call with 24h staleTime

- **Decision**: Fetch all 151 summaries once on catalog mount via `useQuery({ queryKey: ['pokemon', 'gen1', 'summaries'], staleTime: 24h })`. Cache persisted to `localStorage` via `@tanstack/query-sync-storage-persister`.
- **Rationale**: Data is static; one fetch covers browsing, search, and filter without further requests. Persistence gives near-instant repeat visits.
- **Alternatives considered**: Per-page fetch (rejected — 7× requests for no benefit); eager per-Pokémon detail prefetch (rejected — 151 requests on load would fight SC-001).

### 5. Summary hydration strategy

- **Decision**: `listGen1Summaries()` issues one `GET /pokemon?limit=151` call for names+URLs, then fetches `/pokemon/{id}` for each of the 151 in parallel batches of 10 to populate sprite URL + types. Results resolve progressively into the React Query cache so partial data can render.
- **Rationale**: PokeAPI's list endpoint doesn't return sprites/types; we need the per-Pokémon call for card content. Batching avoids slamming the API while keeping total fetch time low.
- **Alternatives considered**: Sprite URL construction from Pokémon ID via a hard-coded pattern (rejected — couples us to PokeAPI's sprite repo structure, which has changed historically); GraphQL PokeAPI (rejected — as in parent scope, stability concerns).

### 6. Search matching: substring (case-insensitive) on name, exact on numeric ID

- **Decision**: Implement `matchPokemon(query, summary)` as:
  - If `/^\d+$/.test(trimmed)` → match exact ID (strip leading zeros first).
  - Else → lowercase both sides, test `summary.name.includes(query)`.
- **Rationale**: Matches FR-007 and FR-008; substring matches user intent for partial names like "chu" → Pikachu/Raichu; numeric gets ID-only path to avoid "1" matching every Pokémon with "1" in its name.
- **Alternatives considered**: Prefix-only matching (rejected — worse for "chu", "mew" works either way); fuzzy matching (rejected — overkill; can mislead with typos on a 151-item list where exact substring already works).

### 7. Type filter: set semantics, AND intersection

- **Decision**: `filters: Set<PokemonType>`; a Pokémon passes iff `filters` is a subset of its types. Serialized to URL as comma-separated lowercase names.
- **Rationale**: Matches FR-014 (AND). Set semantics make the serialization order-insensitive.
- **Alternatives considered**: OR semantics (rejected — parent scope and spec explicitly chose AND).

### 8. Debounced search: 150ms

- **Decision**: `useDebouncedValue(query, 150)`. Grid rerenders (and URL updates) only after the user pauses typing for 150ms.
- **Rationale**: Fast enough to feel instant (under SC-002's 500ms budget with margin); long enough to coalesce typical typing bursts.
- **Alternatives considered**: 250ms (too sluggish perceptibly on fast typists); no debounce (excessive URL/history spam).

### 9. URL update strategy: `replace` while typing, `push` on commit

- **Decision**: When the debounced query or filters change due to typing or chip clicks, use `navigate(url, { replace: true })` to avoid polluting browser history. On page changes (explicit navigation action) use `push` so back-button works as users expect.
- **Rationale**: Typing "charizard" shouldn't create 9 history entries; paging through results should.
- **Alternatives considered**: Always `push` (rejected — history spam); always `replace` (rejected — breaks back-from-page-3 expectations).

### 10. Scroll + page restoration on back-nav

- **Decision**: `useScrollRestore()` reads the URL on mount; React Router restores the URL automatically via browser history. The hook additionally captures the current scroll offset in `sessionStorage` keyed by URL on unmount, and restores it on mount. Focus is moved to the previously-clicked card if found.
- **Rationale**: React Router v6 does not restore scroll by default; sessionStorage-keyed-by-URL is the canonical lightweight pattern. Covers FR-005 and SC-005.
- **Alternatives considered**: `react-router-dom` ScrollRestoration component (good but only works in data-router mode — we use the BrowserRouter form); CSS-only anchor scrolling (rejected — doesn't handle variable content heights).

### 11. Empty / error state copy and CTAs

- **Decision**:
  - **Search empty**: "No Pokémon match 'xyz'." + button "Clear search".
  - **Filter empty**: "No Gen 1 Pokémon combine those types." + button "Clear filters".
  - **Search + filter both empty**: "No Pokémon match your search and filters." + button "Reset all".
  - **Upstream error**: "Couldn't load the Pokédex." + button "Retry".
- **Rationale**: Specific copy helps users understand which control to adjust. Single-button CTAs keep the recovery path obvious.
- **Alternatives considered**: Generic "No results" for all zero-result cases (rejected — loses actionability).

### 12. `<TypeBadge>` vs `<TypeFilterChip>`: shared vs specialized

- **Decision**: Two separate components. `TypeBadge` is presentational (display-only). `TypeFilterChip` uses `TypeBadge` internally and adds toggle state + click/keyboard handlers.
- **Rationale**: Keeps the tokenized type visual in one place (DRY) while letting the filter add interactive affordances (focus ring, pressed state) without leaking them into read-only badge usages on cards.
- **Alternatives considered**: Single `TypeBadge` with an `interactive` prop (rejected — muddies the props surface and makes a11y harder to reason about).

### 13. Keyboard navigation inside the grid

- **Decision**: Cards are `<a>` elements with `tabIndex` 0. Grid listens for ArrowRight/Left/Up/Down on the grid container and moves focus to adjacent cards based on visual row/column. Down-arrow from the search input moves focus to the first card of the current page.
- **Rationale**: Meets FR-010 and SC-006 (keyboard-only path). Using real `<a>` elements makes the cards work with screen readers and right-click-open-in-new-tab for free.
- **Alternatives considered**: `<button>` cards (rejected — loses native link semantics); Tab-only navigation (rejected — painful in a 24-card grid).

### 14. Testing approach

- **Decision**: Unit tests per component (props/states/a11y via RTL). Hook tests for `useCatalogQuery`, `useDebouncedValue`, `matchPokemon`. One integration test in `HomePage.test.tsx` that exercises the full round-trip: render → type search → switch pages → apply filter → verify URL and visible cards at each step, backed by MSW fixtures.
- **Rationale**: Aligns with constitution principle III and the React Core Component Architecture standard (colocation + RTL).
- **Alternatives considered**: E2E Playwright (out of scope for this feature; good follow-up).

## Open Questions

None.
