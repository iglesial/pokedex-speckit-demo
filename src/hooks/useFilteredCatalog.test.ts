import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredCatalog } from './useFilteredCatalog';
import type { PokemonSummary, CatalogQuery } from '../types/pokemon';

function makeSummaries(count: number): PokemonSummary[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `poke-${i + 1}`,
    types: i % 2 === 0 ? ['fire'] : ['water'],
    spriteUrl: null,
  }));
}

const emptyQuery: CatalogQuery = { q: '', types: new Set(), page: 1 };

describe('useFilteredCatalog', () => {
  it('returns all summaries when no filters, paginates to 24 per page', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() => useFilteredCatalog(summaries, emptyQuery));
    expect(result.current.all).toHaveLength(151);
    expect(result.current.page).toHaveLength(24);
    expect(result.current.totalPages).toBe(Math.ceil(151 / 24));
  });

  it('last page has 151 - 6*24 = 7 items', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() =>
      useFilteredCatalog(summaries, { ...emptyQuery, page: 7 }),
    );
    expect(result.current.page).toHaveLength(7);
  });

  it('clamps out-of-range page to last valid page', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() =>
      useFilteredCatalog(summaries, { ...emptyQuery, page: 99 }),
    );
    expect(result.current.pageIndex).toBe(6); // 7th page (0-indexed)
  });

  it('renders ascending id order across pages (invariant I5)', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() => useFilteredCatalog(summaries, emptyQuery));
    const ids = result.current.page.map((p) => p.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('applies name search', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() =>
      useFilteredCatalog(summaries, { ...emptyQuery, q: 'poke-25' }),
    );
    expect(result.current.all).toHaveLength(1);
    expect(result.current.all[0].id).toBe(25);
  });

  it('applies numeric id search', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() =>
      useFilteredCatalog(summaries, { ...emptyQuery, q: '25' }),
    );
    expect(result.current.all).toHaveLength(1);
    expect(result.current.all[0].id).toBe(25);
  });

  it('applies type AND filter', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() =>
      useFilteredCatalog(summaries, { ...emptyQuery, types: new Set(['fire']) }),
    );
    // evens → fire; 151 items → 76 fire
    expect(result.current.all).toHaveLength(76);
  });

  it('marks isEmpty when no match', () => {
    const summaries = makeSummaries(151);
    const { result } = renderHook(() =>
      useFilteredCatalog(summaries, { ...emptyQuery, q: 'zzz' }),
    );
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.totalPages).toBe(1);
  });
});
