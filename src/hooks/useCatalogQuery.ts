import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CatalogQuery, PokemonType } from '../types/pokemon';
import { TYPE_LIST } from '../config/catalog';

const TYPE_SET: ReadonlySet<string> = new Set(TYPE_LIST);

function parseTypes(raw: string | null): Set<PokemonType> {
  if (!raw) return new Set();
  const result = new Set<PokemonType>();
  for (const part of raw.split(',')) {
    const lower = part.trim().toLowerCase();
    if (TYPE_SET.has(lower)) result.add(lower as PokemonType);
  }
  return result;
}

function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? '1', 10);
  if (isNaN(n) || n < 1) return 1;
  return n;
}

export function parseCatalogQuery(params: URLSearchParams): CatalogQuery {
  return {
    q: (params.get('q') ?? '').trim(),
    types: parseTypes(params.get('types')),
    page: parsePage(params.get('page')),
  };
}

export function serializeCatalogQuery(query: Partial<CatalogQuery>): URLSearchParams {
  const out = new URLSearchParams();
  if (query.q && query.q.trim() !== '') out.set('q', query.q.trim().toLowerCase());
  if (query.types && query.types.size > 0) {
    out.set('types', Array.from(query.types).sort().join(','));
  }
  if (query.page && query.page > 1) out.set('page', String(query.page));
  return out;
}

interface UpdateOptions {
  replace?: boolean;
  resetPage?: boolean;
}

export function useCatalogQuery(): [
  CatalogQuery,
  (patch: Partial<CatalogQuery>, opts?: UpdateOptions) => void,
] {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const query = useMemo(() => parseCatalogQuery(params), [params]);

  const update = useCallback(
    (patch: Partial<CatalogQuery>, opts: UpdateOptions = {}) => {
      const next: CatalogQuery = {
        q: patch.q !== undefined ? patch.q : query.q,
        types: patch.types !== undefined ? patch.types : query.types,
        page: opts.resetPage ? 1 : patch.page !== undefined ? patch.page : query.page,
      };
      const sp = serializeCatalogQuery(next);
      const search = sp.toString();
      navigate(`/${search ? `?${search}` : ''}`, { replace: opts.replace });
    },
    [navigate, query.q, query.types, query.page],
  );

  return [query, update];
}
