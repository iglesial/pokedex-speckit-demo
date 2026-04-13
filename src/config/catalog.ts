import type { PokemonType } from '../types/pokemon';

export const PAGE_SIZE = 24;
export const GEN1_RANGE = { min: 1, max: 151 } as const;

export const TYPE_LIST: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

export const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
