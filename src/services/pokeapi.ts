import { POKEAPI_BASE, GEN1_RANGE, TYPE_LIST } from '../config/catalog';
import type {
  BaseStats,
  EvolutionChain,
  PokemonAbility,
  PokemonDetail,
  PokemonSummary,
  PokemonType,
} from '../types/pokemon';
import { normalizeFlavor } from '../utils/normalizeFlavor';
import {
  parseEvolutionChain,
  type PokeApiChainResponse,
} from '../utils/parseEvolutionChain';

export class PokeApiError extends Error {
  constructor(public status: number, public url: string, message?: string) {
    super(message ?? `PokeAPI error ${status} at ${url}`);
  }
}

export class PokemonNotFoundError extends Error {
  constructor(public id: number | string) {
    super(`Pokémon not found: ${id}`);
  }
}

const TYPE_SET: ReadonlySet<string> = new Set(TYPE_LIST);

function isKnownType(name: string): name is PokemonType {
  return TYPE_SET.has(name);
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new PokeApiError(res.status, url);
  return res.json();
}

interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string } }[];
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default?: string | null } };
  };
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean; slot: number }[];
}

interface SpeciesResponse {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  evolution_chain?: { url: string };
}

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : 0;
}

function toSummary(p: PokemonResponse): PokemonSummary {
  const types = p.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name)
    .filter(isKnownType);
  const artwork = p.sprites.other?.['official-artwork']?.front_default ?? null;
  return {
    id: p.id,
    name: p.name,
    types,
    spriteUrl: artwork ?? p.sprites.front_default ?? null,
  };
}

const STAT_NAME_MAP: Record<string, keyof BaseStats> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
};

function toBaseStats(stats: PokemonResponse['stats']): BaseStats {
  const out: BaseStats = {
    hp: 0, attack: 0, defense: 0,
    specialAttack: 0, specialDefense: 0, speed: 0,
  };
  for (const entry of stats) {
    const key = STAT_NAME_MAP[entry.stat.name];
    if (key) out[key] = entry.base_stat;
  }
  return out;
}

function toAbilities(abilities: PokemonResponse['abilities']): PokemonAbility[] {
  return [...abilities]
    .sort((a, b) => a.slot - b.slot)
    .map((a) => ({ name: a.ability.name, isHidden: a.is_hidden }));
}

function pickEnglishFlavor(entries: SpeciesResponse['flavor_text_entries']): string | null {
  const english = entries.filter((e) => e.language.name === 'en');
  if (english.length === 0) return null;
  // API orders oldest→newest; take most recent
  const most = english[english.length - 1];
  const normalized = normalizeFlavor(most.flavor_text);
  return normalized.length === 0 ? null : normalized;
}

/**
 * Fetches the list of Gen 1 Pokémon (IDs 1..151) as PokemonSummary objects.
 * Individual per-Pokémon fetches are batched to avoid hammering the API.
 * Failures on individual Pokémon degrade to stub summaries rather than failing
 * the whole list.
 */
export async function listGen1Summaries(): Promise<PokemonSummary[]> {
  const ids = Array.from(
    { length: GEN1_RANGE.max - GEN1_RANGE.min + 1 },
    (_, i) => GEN1_RANGE.min + i,
  );
  const batchSize = 10;
  const out: PokemonSummary[] = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (id) => {
        try {
          const p = (await getJson(`${POKEAPI_BASE}/pokemon/${id}`)) as PokemonResponse;
          return toSummary(p);
        } catch {
          return {
            id,
            name: `pokemon-${id}`,
            types: [] as PokemonType[],
            spriteUrl: null,
          };
        }
      }),
    );
    out.push(...results);
  }
  return out;
}

export async function listTypes(): Promise<PokemonType[]> {
  const data = (await getJson(`${POKEAPI_BASE}/type`)) as { results: { name: string }[] };
  return data.results.map((r) => r.name).filter(isKnownType);
}

/**
 * Fetches combined /pokemon/{id} + /pokemon-species/{id} and projects to
 * a single PokemonDetail domain object. Throws PokemonNotFoundError for
 * out-of-range IDs (no network) and for upstream 404s.
 * Cache key should be ['pokemon-detail', id]; caller configures 24h staleTime.
 */
export async function getPokemonDetail(id: number): Promise<PokemonDetail> {
  if (!Number.isInteger(id) || id < GEN1_RANGE.min || id > GEN1_RANGE.max) {
    throw new PokemonNotFoundError(id);
  }
  try {
    const [pokemon, species] = await Promise.all([
      getJson(`${POKEAPI_BASE}/pokemon/${id}`) as Promise<PokemonResponse>,
      getJson(`${POKEAPI_BASE}/pokemon-species/${id}`) as Promise<SpeciesResponse>,
    ]);
    const types = pokemon.types
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name)
      .filter(isKnownType);
    const artwork = pokemon.sprites.other?.['official-artwork']?.front_default ?? null;
    const chainUrl = species.evolution_chain?.url ?? '';
    const evolutionChainId = idFromUrl(chainUrl);
    return {
      id: pokemon.id,
      name: pokemon.name,
      types,
      artworkUrl: artwork ?? pokemon.sprites.front_default ?? null,
      stats: toBaseStats(pokemon.stats),
      heightDecimetres: pokemon.height,
      weightHectograms: pokemon.weight,
      abilities: toAbilities(pokemon.abilities),
      flavorText: pickEnglishFlavor(species.flavor_text_entries),
      evolutionChainId,
    };
  } catch (e) {
    if (e instanceof PokeApiError && e.status === 404) {
      throw new PokemonNotFoundError(id);
    }
    throw e;
  }
}

/**
 * Fetches /evolution-chain/{chainId}, parses to domain model, and hydrates
 * each surviving Gen 1 stage's sprite via a batched /pokemon/{id} call.
 * Sprite fetch failures per stage degrade gracefully to `spriteUrl: null`;
 * they do not fail the whole chain call.
 */
export async function getEvolutionChain(
  chainId: number,
  currentPokemonId: number,
): Promise<EvolutionChain> {
  const raw = (await getJson(
    `${POKEAPI_BASE}/evolution-chain/${chainId}`,
  )) as PokeApiChainResponse;
  const chain = parseEvolutionChain(raw, currentPokemonId);

  // Hydrate sprites + names in parallel; swallow per-stage failures.
  // The evolution-chain endpoint returns only species URLs — pick the
  // authoritative display name from /pokemon/{id} so the chain renders
  // consistently with the rest of the app.
  const hydrated = await Promise.all(
    chain.stages.map(async (stage) => {
      try {
        const p = (await getJson(`${POKEAPI_BASE}/pokemon/${stage.pokemonId}`)) as PokemonResponse;
        const artwork = p.sprites.other?.['official-artwork']?.front_default ?? null;
        return {
          ...stage,
          name: p.name,
          spriteUrl: artwork ?? p.sprites.front_default ?? null,
        };
      } catch {
        return stage;
      }
    }),
  );

  return { ...chain, stages: hydrated };
}
