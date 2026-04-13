import { POKEAPI_BASE, GEN1_RANGE, TYPE_LIST } from '../config/catalog';
import type { PokemonSummary, PokemonType } from '../types/pokemon';

export class PokeApiError extends Error {
  constructor(public status: number, public url: string, message?: string) {
    super(message ?? `PokeAPI error ${status} at ${url}`);
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
  types: { slot: number; type: { name: string } }[];
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default?: string | null } };
  };
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
