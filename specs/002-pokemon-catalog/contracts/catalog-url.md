# Contract: Catalog URL

The catalog page (`/`) accepts three query parameters that, together, fully describe the user's discovery intent. The URL is the **single source of truth** for this state: any UI change updates the URL, and the UI renders from the URL on every navigation.

## Parameters

| Name | Type | Default | Format | Notes |
|------|------|---------|--------|-------|
| `q` | string | `""` | arbitrary | URL-decoded, then trimmed; empty/whitespace omitted from canonical URL |
| `types` | string (csv) | empty | `fire,flying` | lowercase type names; unknown values dropped silently |
| `page` | integer ≥ 1 | `1` | `3` | clamped to `[1, totalPages]` of the current filtered set |

## Examples

| URL | Meaning |
|-----|---------|
| `/` | Page 1 of the full roster |
| `/?page=3` | Page 3 of the full roster |
| `/?q=char` | Page 1 of Pokémon whose name contains "char" |
| `/?types=fire,flying` | Page 1 of Fire AND Flying Pokémon |
| `/?q=char&types=fire&page=2` | Page 2 of Fire Pokémon whose name contains "char" |
| `/?page=99` | Clamps to the last valid page of the full roster (FR-005e) |
| `/?types=unknown` | Treated as no type filter; `unknown` dropped |

## Update rules

- **Typing in search**: history `replace`, debounced 150ms. Page is reset to 1.
- **Toggling a type chip**: history `replace`. Page is reset to 1.
- **Clicking reset**: history `replace`. Clears `q` and/or `types`. Page reset to 1.
- **Changing page (prev/next/direct)**: history `push`. Query/filters preserved.
- **Returning from detail page**: browser history restores the exact URL; scroll + focused card restored from `sessionStorage`.

## Round-trip invariant

For any valid `CatalogQuery`, `parse(serialize(q)) === q` (with canonical key omission for defaults).

## Testing contract

`hooks/useCatalogQuery.test.ts` MUST include:
- Parse `/` → defaults.
- Parse `?q=CHAR&types=FIRE,FLYING&page=2` → normalized lowercase.
- Parse `?types=unknown,fire` → `{ types: Set(["fire"]) }`.
- Parse `?page=abc` → `page: 1`.
- Parse `?page=99` (with a filtered set of 2 pages) → `page: 2` (clamped).
- Serialize `{ q: "", types: new Set(), page: 1 }` → `/`.
- Serialize `{ q: "char", types: new Set(["fire"]), page: 2 }` → `/?q=char&types=fire&page=2`.
