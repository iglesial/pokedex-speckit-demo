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
import { TypeFilterBar } from '../../components/core/TypeFilterBar/TypeFilterBar';
import { useCatalogQuery } from '../../hooks/useCatalogQuery';
import { useFilteredCatalog } from '../../hooks/useFilteredCatalog';
import { useScrollRestore } from '../../hooks/useScrollRestore';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { PAGE_SIZE } from '../../config/catalog';
import type { PokemonType } from '../../types/pokemon';
import './HomePage.css';

interface EmptyCopy {
  title: string;
  description?: string;
  actionLabel: string;
}

function emptyCopyFor(hasSearch: boolean, hasFilters: boolean, q: string): EmptyCopy {
  if (hasSearch && hasFilters) {
    return {
      title: 'No Pokémon match your search and filters.',
      description: 'Try clearing one to see more results.',
      actionLabel: 'Reset all',
    };
  }
  if (hasFilters) {
    return {
      title: 'No Gen 1 Pokémon combine those types.',
      actionLabel: 'Clear filters',
    };
  }
  return {
    title: `No Pokémon match "${q}".`,
    description: 'Try a different name or National Dex ID.',
    actionLabel: 'Clear search',
  };
}

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
  // a stale debounced value can overwrite an intentional external clear.
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

  const onTypesChange = (next: Set<PokemonType>) => {
    update({ types: next }, { replace: true, resetPage: true });
  };

  const hasSearch = query.q !== '';
  const hasFilters = query.types.size > 0;

  const onResetEmpty = () => {
    if (hasSearch && hasFilters) {
      setRawQuery('');
      update({ q: '', types: new Set() }, { replace: true, resetPage: true });
    } else if (hasFilters) {
      update({ types: new Set() }, { replace: true, resetPage: true });
    } else {
      setRawQuery('');
      update({ q: '' }, { replace: true, resetPage: true });
    }
  };

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
        <TypeFilterBar active={query.types} onChange={onTypesChange} />
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
                (() => {
                  const copy = emptyCopyFor(hasSearch, hasFilters, query.q);
                  return (
                    <EmptyState
                      title={copy.title}
                      description={copy.description}
                      actionLabel={copy.actionLabel}
                      onAction={onResetEmpty}
                    />
                  );
                })()
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
