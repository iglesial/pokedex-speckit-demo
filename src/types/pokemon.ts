export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface PokemonSummary {
  id: number;
  name: string;
  types: PokemonType[];
  spriteUrl: string | null;
}

export interface CatalogQuery {
  q: string;
  types: Set<PokemonType>;
  page: number;
}

export interface FilteredCatalog {
  all: PokemonSummary[];
  page: PokemonSummary[];
  totalPages: number;
  pageIndex: number;
  isEmpty: boolean;
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonType[];
  artworkUrl: string | null;
  stats: BaseStats;
  heightDecimetres: number;
  weightHectograms: number;
  abilities: PokemonAbility[];
  flavorText: string | null;
}
