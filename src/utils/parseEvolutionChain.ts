import { GEN1_RANGE } from '../config/catalog';
import type { EvolutionChain, EvolutionEdge, EvolutionStage } from '../types/pokemon';
import { formatEvolutionTrigger } from './formatEvolutionTrigger';

interface PokeApiChainNode {
  species: { name: string; url: string };
  evolution_details: unknown[];
  evolves_to: PokeApiChainNode[];
}

export interface PokeApiChainResponse {
  id: number;
  chain: PokeApiChainNode;
}

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : 0;
}

function isGen1(id: number): boolean {
  return id >= GEN1_RANGE.min && id <= GEN1_RANGE.max;
}

export function parseEvolutionChain(
  raw: PokeApiChainResponse,
  currentPokemonId: number,
): EvolutionChain {
  const rawStages: Array<{ pokemonId: number; name: string }> = [];
  const rawEdges: Array<{
    fromPokemonId: number;
    toPokemonId: number;
    details: unknown[];
  }> = [];

  function walk(node: PokeApiChainNode): void {
    const id = idFromUrl(node.species.url);
    if (!rawStages.some((s) => s.pokemonId === id)) {
      rawStages.push({ pokemonId: id, name: node.species.name });
    }
    for (const child of node.evolves_to) {
      const childId = idFromUrl(child.species.url);
      rawEdges.push({
        fromPokemonId: id,
        toPokemonId: childId,
        details: child.evolution_details,
      });
      walk(child);
    }
  }

  walk(raw.chain);

  const hasNoEvolutions = raw.chain.evolves_to.length === 0;

  const filteredStages: EvolutionStage[] = rawStages
    .filter((s) => isGen1(s.pokemonId))
    .map((s) => ({
      pokemonId: s.pokemonId,
      name: s.name,
      spriteUrl: null,
      isCurrent: s.pokemonId === currentPokemonId,
    }));

  const survivingIds = new Set(filteredStages.map((s) => s.pokemonId));

  const edges: EvolutionEdge[] = rawEdges
    .filter((e) => survivingIds.has(e.fromPokemonId) && survivingIds.has(e.toPokemonId))
    .map((e) => {
      const label = formatEvolutionTrigger(e.details as Parameters<typeof formatEvolutionTrigger>[0]);
      return {
        fromPokemonId: e.fromPokemonId,
        toPokemonId: e.toPokemonId,
        triggerLabel: label?.short ?? null,
        accessibleLabel: label?.accessible ?? null,
      };
    });

  const outDegree = new Map<number, number>();
  for (const e of edges) {
    outDegree.set(e.fromPokemonId, (outDegree.get(e.fromPokemonId) ?? 0) + 1);
  }
  const isBranching = Array.from(outDegree.values()).some((c) => c >= 2);

  return {
    chainId: raw.id,
    stages: filteredStages,
    edges,
    hasNoEvolutions,
    isBranching,
  };
}
