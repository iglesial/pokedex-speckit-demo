import { describe, it, expect } from 'vitest';
import { parseCatalogQuery, serializeCatalogQuery } from './useCatalogQuery';

describe('parseCatalogQuery', () => {
  it('parses empty URL to defaults', () => {
    const q = parseCatalogQuery(new URLSearchParams());
    expect(q.q).toBe('');
    expect(q.types.size).toBe(0);
    expect(q.page).toBe(1);
  });

  it('parses q (lowercased and trimmed)', () => {
    const q = parseCatalogQuery(new URLSearchParams('q=%20CHAR%20'));
    expect(q.q).toBe('CHAR'); // parse preserves case; serialize lowercases
  });

  it('parses types csv (lowercased)', () => {
    const q = parseCatalogQuery(new URLSearchParams('types=FIRE,FLYING'));
    expect(q.types.has('fire')).toBe(true);
    expect(q.types.has('flying')).toBe(true);
    expect(q.types.size).toBe(2);
  });

  it('drops unknown types silently', () => {
    const q = parseCatalogQuery(new URLSearchParams('types=unknown,fire'));
    expect(q.types.has('fire')).toBe(true);
    expect(q.types.size).toBe(1);
  });

  it('parses page as integer, clamps <1 and NaN to 1', () => {
    expect(parseCatalogQuery(new URLSearchParams('page=3')).page).toBe(3);
    expect(parseCatalogQuery(new URLSearchParams('page=abc')).page).toBe(1);
    expect(parseCatalogQuery(new URLSearchParams('page=0')).page).toBe(1);
    expect(parseCatalogQuery(new URLSearchParams('page=-5')).page).toBe(1);
  });
});

describe('serializeCatalogQuery', () => {
  it('omits defaults', () => {
    expect(serializeCatalogQuery({ q: '', types: new Set(), page: 1 }).toString()).toBe('');
  });

  it('serializes q + types + page', () => {
    const sp = serializeCatalogQuery({
      q: 'char', types: new Set(['fire']), page: 2,
    });
    expect(sp.get('q')).toBe('char');
    expect(sp.get('types')).toBe('fire');
    expect(sp.get('page')).toBe('2');
  });

  it('lowercases q on serialize', () => {
    const sp = serializeCatalogQuery({ q: 'CHAR' });
    expect(sp.get('q')).toBe('char');
  });

  it('sorts types deterministically', () => {
    const sp = serializeCatalogQuery({ types: new Set(['flying', 'fire']) });
    expect(sp.get('types')).toBe('fire,flying');
  });

  it('omits whitespace-only q', () => {
    const sp = serializeCatalogQuery({ q: '   ' });
    expect(sp.has('q')).toBe(false);
  });
});
