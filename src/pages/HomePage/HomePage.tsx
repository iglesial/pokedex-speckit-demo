import { useQuery } from '@tanstack/react-query';
import { listGen1Summaries } from '../../services/pokeapi';
import { Card } from '../../components/core/Card/Card';
import { SkeletonCard } from '../../components/core/SkeletonCard/SkeletonCard';
import { CatalogGrid } from '../../components/core/CatalogGrid/CatalogGrid';
import { Pagination } from '../../components/core/Pagination/Pagination';
import { ErrorState } from '../../components/core/ErrorState/ErrorState';
import { useCatalogQuery } from '../../hooks/useCatalogQuery';
import { useFilteredCatalog } from '../../hooks/useFilteredCatalog';
import { useScrollRestore } from '../../hooks/useScrollRestore';
import { PAGE_SIZE } from '../../config/catalog';
import './HomePage.css';

export function HomePage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['pokemon', 'gen1', 'summaries'],
    queryFn: listGen1Summaries,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const [query, update] = useCatalogQuery();
  const filtered = useFilteredCatalog(data, query);
  const { rememberFocus } = useScrollRestore();

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">Pokédex</h1>
        <p className="home__subtitle">Gen 1 · 151 Pokémon</p>
      </header>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <CatalogGrid>
            {isPending
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : filtered.page.map((pokemon) => (
                  <Card
                    key={pokemon.id}
                    pokemon={pokemon}
                    onFocusCard={rememberFocus}
                  />
                ))}
          </CatalogGrid>
          {!isPending && (
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
