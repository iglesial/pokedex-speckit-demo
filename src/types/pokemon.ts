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
  evolutionChainId: number;
}

export interface EvolutionStage {
  pokemonId: number;
  name: string;
  spriteUrl: string | null;
  isCurrent: boolean;
}

export interface EvolutionEdge {
  fromPokemonId: number;
  toPokemonId: number;
  triggerLabel: string | null;
  accessibleLabel: string | null;
}

export interface EvolutionChain {
  chainId: number;
  stages: EvolutionStage[];
  edges: EvolutionEdge[];
  hasNoEvolutions: boolean;
  isBranching: boolean;
}

export type EvolutionSectionState =
  | { tag: 'loading' }
  | { tag: 'loaded'; chain: EvolutionChain }
  | { tag: 'no-evolutions' }
  | { tag: 'error'; onRetry: () => void };
