import { useMemo } from 'react';
import type { CatalogQuery, FilteredCatalog, PokemonSummary } from '../types/pokemon';
import { matchesQuery, matchesTypes } from '../utils/matchPokemon';
import { PAGE_SIZE } from '../config/catalog';

export function useFilteredCatalog(
  summaries: PokemonSummary[] | undefined,
  query: CatalogQuery,
): FilteredCatalog {
  return useMemo(() => {
    const source = summaries ?? [];
    const all = source.filter(
      (s) => matchesQuery(s, query.q) && matchesTypes(s, query.types),
    );
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    const clampedPage = Math.min(Math.max(1, query.page), totalPages);
    const pageIndex = clampedPage - 1;
    const page = all.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
    return {
      all,
      page,
      totalPages,
      pageIndex,
      isEmpty: all.length === 0,
    };
  }, [summaries, query.q, query.types, query.page]);
}
