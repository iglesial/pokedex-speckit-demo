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
