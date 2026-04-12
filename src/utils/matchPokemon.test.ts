import { describe, it, expect } from 'vitest';
import { matchesQuery, matchesTypes } from './matchPokemon';
import type { PokemonSummary } from '../types/pokemon';

const bulbasaur: PokemonSummary = {
  id: 1, name: 'bulbasaur', types: ['grass', 'poison'], spriteUrl: null,
};
const charizard: PokemonSummary = {
  id: 6, name: 'charizard', types: ['fire', 'flying'], spriteUrl: null,
};
const pikachu: PokemonSummary = {
  id: 25, name: 'pikachu', types: ['electric'], spriteUrl: null,
};

describe('matchesQuery', () => {
  it('matches all with empty query', () => {
    expect(matchesQuery(pikachu, '')).toBe(true);
  });
  it('matches all with whitespace-only query', () => {
    expect(matchesQuery(pikachu, '   ')).toBe(true);
  });
  it('matches name substring case-insensitively', () => {
    expect(matchesQuery(charizard, 'char')).toBe(true);
    expect(matchesQuery(charizard, 'CHAR')).toBe(true);
    expect(matchesQuery(charizard, 'zard')).toBe(true);
  });
  it('does not match non-substrings', () => {
    expect(matchesQuery(pikachu, 'zzz')).toBe(false);
  });
  it('matches exact numeric ID', () => {
    expect(matchesQuery(pikachu, '25')).toBe(true);
    expect(matchesQuery(bulbasaur, '25')).toBe(false);
  });
  it('matches numeric ID with leading zeros', () => {
    expect(matchesQuery(pikachu, '025')).toBe(true);
    expect(matchesQuery(pikachu, '0025')).toBe(true);
  });
  it('numeric query does not fall through to name match', () => {
    // "1" should only match id=1, not every name containing "1"
    expect(matchesQuery(bulbasaur, '1')).toBe(true);
    expect(matchesQuery(pikachu, '1')).toBe(false);
  });
});

describe('matchesTypes', () => {
  it('matches all with empty set', () => {
    expect(matchesTypes(pikachu, new Set())).toBe(true);
  });
  it('matches single-type filter', () => {
    expect(matchesTypes(charizard, new Set(['fire']))).toBe(true);
    expect(matchesTypes(pikachu, new Set(['fire']))).toBe(false);
  });
  it('matches with AND semantics on multiple types', () => {
    expect(matchesTypes(charizard, new Set(['fire', 'flying']))).toBe(true);
    expect(matchesTypes(charizard, new Set(['fire', 'water']))).toBe(false);
  });
});
