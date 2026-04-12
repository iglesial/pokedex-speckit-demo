# Contract: Catalog UI Components

Every catalog-related core component ships with the following contract. Props are typed in `src/components/index.ts` (barrel export).

## `<Card>`

Displays a single Pokémon card.

```ts
interface CardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  pokemon: PokemonSummary;
  loading?: boolean;  // if true, render as SkeletonCard instead
}
```

**Behavior**:
- Renders as `<a href={`/pokemon/${id}`}>` so middle-click / right-click work natively.
- Shows sprite, name (titlecased), `#025`-formatted ID, and one or two `<TypeBadge>` children.
- On hover: shadow elevation lifts via `--shadow-sm` → `--shadow-md` with ≤250ms transition.
- On focus-visible: shows focus ring token.

**Tests** (`Card.test.tsx`): renders loading skeleton; renders all required fields; applies correct href; passes through a11y.

---

## `<TypeBadge>`

Presentational type indicator.

```ts
interface TypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: PokemonType;
}
```

**Behavior**:
- Reads color from `var(--type-${type})`.
- Renders the type name titlecased.
- No interactive affordances.

---

## `<SkeletonCard>`

```ts
interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}
```

Pulses at `--motion-slow` via a single `animation` keyframe. Disabled under `prefers-reduced-motion`.

---

## `<SearchInput>`

Header search input.

```ts
interface SearchInputProps {
  value: string;
  onChange: (next: string) => void;
  onArrowDown?: () => void;  // move focus into the grid
  placeholder?: string;
}
```

**Behavior**:
- Labelled with `<label>` for screen readers.
- Shows a clear (×) button when `value` is non-empty; pressing it calls `onChange("")`.
- `onArrowDown` fires on ArrowDown keydown so the parent page can move focus to the first card.

**Tests**: clears on button click; fires onArrowDown; announces via a11y label.

---

## `<TypeFilterChip>`

```ts
interface TypeFilterChipProps {
  type: PokemonType;
  active: boolean;
  disabled?: boolean;  // true when no match is possible given other active filters
  onToggle: (type: PokemonType) => void;
}
```

**Behavior**:
- Renders as `<button aria-pressed={active}>`.
- Visually distinguishes active / inactive / disabled.
- Clicking calls `onToggle(type)`.

---

## `<TypeFilterBar>`

```ts
interface TypeFilterBarProps {
  active: Set<PokemonType>;
  onChange: (next: Set<PokemonType>) => void;
}
```

Composes 18 `<TypeFilterChip>`s plus a "Reset filters" button. The reset button is hidden when `active.size === 0`.

---

## `<Pagination>`

```ts
interface PaginationProps {
  page: number;          // 1-based current
  totalPages: number;    // ≥ 1
  onChange: (next: number) => void;
  ariaLabel?: string;
}
```

**Behavior**:
- Renders `<nav aria-label={ariaLabel || 'Catalog pagination'}>` containing prev/next buttons and a compact page number list (e.g., `1 2 … 5 6 7`).
- Prev disabled on page 1; next disabled on last page.
- When `totalPages === 1`, the entire control renders nothing (FR-005 — edge case: single-page result set).

**Tests**: boundary disabled states; elision for >7 pages; keyboard accessibility.

---

## `<CatalogGrid>`

```ts
interface CatalogGridProps {
  children: React.ReactNode;
}
```

CSS Grid layout (`grid-template-columns: repeat(auto-fill, minmax(...))`). Responsive down to 1 column at narrow viewports.

---

## `<EmptyState>`

```ts
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

Used for all three zero-result variants (search-only, filter-only, both) and for the "type has no Gen 1 match" edge case.

---

## `<ErrorState>`

```ts
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
```

Rendered when the summary fetch fails. Defaults: message "Couldn't load the Pokédex.", action "Retry".

---

## Hooks

### `useCatalogQuery(): [CatalogQuery, (patch: Partial<CatalogQuery>, opts?: { replace?: boolean }) => void]`

Parses the URL into a `CatalogQuery` and returns an updater that writes back. Clamps `page` against the current filtered set length (wired via a ref from the page component).

### `useFilteredCatalog(summaries, query): FilteredCatalog`

Pure; memoized. See [data-model.md](../data-model.md).

### `useDebouncedValue<T>(value: T, ms: number): T`

Generic debounce. Default `ms` = 150 for search.

### `useScrollRestore(): void`

Attaches to the catalog page. Captures `{ scrollY, focusCardId }` into `sessionStorage` keyed by current URL on unmount; restores them on mount for the same URL.

## Testing contract

Each component and hook above MUST have a colocated `<Name>.test.tsx` exercising:
- The happy path.
- At least one error/edge path (e.g., `totalPages === 1` for `<Pagination>`, `types=unknown` for `useCatalogQuery`).
- Basic a11y (role/label assertions where applicable).

One integration test at `src/pages/HomePage/HomePage.test.tsx` exercises the full user flow:
type "char" → see 3 filtered cards → activate "Fire" filter → still 3 → activate "Flying" → 1 (Charizard) → reset filters → 151 cards, paginated to 24 on page 1.
