import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listGen1Summaries } from '../../services/pokeapi';
import { Card } from '../../components/core/Card/Card';
import { SkeletonCard } from '../../components/core/SkeletonCard/SkeletonCard';
import { CatalogGrid } from '../../components/core/CatalogGrid/CatalogGrid';
import { Pagination } from '../../components/core/Pagination/Pagination';
import { ErrorState } from '../../components/core/ErrorState/ErrorState';
import { SearchInput } from '../../components/core/SearchInput/SearchInput';
import { EmptyState } from '../../components/core/EmptyState/EmptyState';
import { useCatalogQuery } from '../../hooks/useCatalogQuery';
import { useFilteredCatalog } from '../../hooks/useFilteredCatalog';
import { useScrollRestore } from '../../hooks/useScrollRestore';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { PAGE_SIZE } from '../../config/catalog';
import './HomePage.css';

export function HomePage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['pokemon', 'gen1', 'summaries'],
    queryFn: listGen1Summaries,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const [query, update] = useCatalogQuery();
  const [rawQuery, setRawQuery] = useState(query.q);
  const debouncedQuery = useDebouncedValue(rawQuery, 150);
  const gridRef = useRef<HTMLDivElement>(null);

  // Commit debounced search into URL, resetting page to 1.
  // Only commit when the debounce has caught up to the live input — otherwise
  // a stale debounced value can overwrite an intentional external clear
  // (e.g., "Clear search" CTA firing during the 150ms debounce window).
  useEffect(() => {
    if (debouncedQuery !== rawQuery) return;
    if (debouncedQuery.trim() !== query.q) {
      update({ q: debouncedQuery.trim() }, { replace: true, resetPage: true });
    }
  }, [debouncedQuery, rawQuery, query.q, update]);

  // Keep local input in sync when URL changes externally (e.g., back button)
  useEffect(() => {
    if (query.q !== rawQuery.trim()) setRawQuery(query.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.q]);

  const filtered = useFilteredCatalog(data, query);
  const { rememberFocus } = useScrollRestore();

  const focusFirstCard = () => {
    const firstLink = gridRef.current?.querySelector<HTMLElement>('a[data-card-id]');
    firstLink?.focus();
  };

  const isSearchActive = query.q !== '';

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">Pokédex</h1>
        <p className="home__subtitle">Gen 1 · 151 Pokémon</p>
      </header>

      <div className="home__toolbar">
        <SearchInput
          value={rawQuery}
          onChange={setRawQuery}
          onArrowDown={focusFirstCard}
        />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div ref={gridRef}>
            <CatalogGrid>
              {isPending ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
              ) : filtered.isEmpty ? (
                <EmptyState
                  title={
                    isSearchActive ? `No Pokémon match "${query.q}".` : 'No Pokémon match.'
                  }
                  description={
                    isSearchActive ? 'Try a different name or National Dex ID.' : undefined
                  }
                  actionLabel={isSearchActive ? 'Clear search' : undefined}
                  onAction={
                    isSearchActive
                      ? () => {
                          setRawQuery('');
                          update({ q: '' }, { replace: true, resetPage: true });
                        }
                      : undefined
                  }
                />
              ) : (
                filtered.page.map((pokemon) => (
                  <Card key={pokemon.id} pokemon={pokemon} onFocusCard={rememberFocus} />
                ))
              )}
            </CatalogGrid>
          </div>
          {!isPending && !filtered.isEmpty && (
            <Pagination
              page={filtered.pageIndex + 1}
              totalPages={filtered.totalPages}
              onChange={(next) => update({ page: next })}
            />
          )}
        </>
      )}
    </div>
  );
}
