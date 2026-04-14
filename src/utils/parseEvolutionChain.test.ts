import { describe, it, expect } from 'vitest';
import { parseEvolutionChain, type PokeApiChainResponse } from './parseEvolutionChain';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

function stage(id: number) {
  return { species: { name: `p${id}`, url: `${POKEAPI_BASE}/pokemon-species/${id}/` } };
}

const bulbasaurChain: PokeApiChainResponse = {
  id: 1,
  chain: {
    ...stage(1),
    evolution_details: [],
    evolves_to: [
      {
        ...stage(2),
        evolution_details: [{ trigger: { name: 'level-up' }, min_level: 16 }],
        evolves_to: [
          {
            ...stage(3),
            evolution_details: [{ trigger: { name: 'level-up' }, min_level: 32 }],
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

// Pichu (#172) → Pikachu → Raichu
const pikachuChain: PokeApiChainResponse = {
  id: 10,
  chain: {
    ...stage(172),
    evolution_details: [],
    evolves_to: [
      {
        ...stage(25),
        evolution_details: [{ trigger: { name: 'level-up' }, min_happiness: 220 }],
        evolves_to: [
          {
            ...stage(26),
            evolution_details: [{ trigger: { name: 'use-item' }, item: { name: 'thunder-stone' } }],
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

// Eevee (133) → Vaporeon (134), Jolteon (135), Flareon (136)
const eeveeChain: PokeApiChainResponse = {
  id: 67,
  chain: {
    ...stage(133),
    evolution_details: [],
    evolves_to: [
      { ...stage(134), evolution_details: [{ trigger: { name: 'use-item' }, item: { name: 'water-stone' } }], evolves_to: [] },
      { ...stage(135), evolution_details: [{ trigger: { name: 'use-item' }, item: { name: 'thunder-stone' } }], evolves_to: [] },
      { ...stage(136), evolution_details: [{ trigger: { name: 'use-item' }, item: { name: 'fire-stone' } }], evolves_to: [] },
    ],
  },
};

const taurosChain: PokeApiChainResponse = {
  id: 59,
  chain: { ...stage(128), evolution_details: [], evolves_to: [] },
};

describe('parseEvolutionChain — linear', () => {
  it('Bulbasaur family → 3 stages, 2 edges, !isBranching, !hasNoEvolutions', () => {
    const chain = parseEvolutionChain(bulbasaurChain, 1);
    expect(chain.stages).toHaveLength(3);
    expect(chain.edges).toHaveLength(2);
    expect(chain.isBranching).toBe(false);
    expect(chain.hasNoEvolutions).toBe(false);
    expect(chain.stages.map((s) => s.pokemonId)).toEqual([1, 2, 3]);
  });

  it('marks the current Pokémon via isCurrent', () => {
    const chain = parseEvolutionChain(bulbasaurChain, 2);
    expect(chain.stages.find((s) => s.pokemonId === 2)?.isCurrent).toBe(true);
    expect(chain.stages.filter((s) => s.isCurrent)).toHaveLength(1);
  });

  it('edge trigger labels come from formatEvolutionTrigger', () => {
    const chain = parseEvolutionChain(bulbasaurChain, 1);
    expect(chain.edges[0]).toMatchObject({
      fromPokemonId: 1, toPokemonId: 2, triggerLabel: 'Lv. 16',
    });
    expect(chain.edges[1].triggerLabel).toBe('Lv. 32');
  });
});

describe('parseEvolutionChain — Gen 1 truncation', () => {
  it('Pichu → Pikachu → Raichu: Pichu dropped, 2 stages / 1 edge, Pikachu as first surviving stage', () => {
    const chain = parseEvolutionChain(pikachuChain, 25);
    expect(chain.stages.map((s) => s.pokemonId)).toEqual([25, 26]);
    expect(chain.edges).toHaveLength(1);
    expect(chain.edges[0]).toMatchObject({ fromPokemonId: 25, toPokemonId: 26 });
    expect(chain.hasNoEvolutions).toBe(false);
  });

  it('out-of-range current Pokémon id still produces a valid chain; no stage is marked current', () => {
    const chain = parseEvolutionChain(pikachuChain, 172);
    expect(chain.stages.every((s) => !s.isCurrent)).toBe(true);
  });
});

describe('parseEvolutionChain — branching', () => {
  it('Eevee family → 4 stages, 3 edges, isBranching', () => {
    const chain = parseEvolutionChain(eeveeChain, 134);
    expect(chain.stages.map((s) => s.pokemonId)).toEqual([133, 134, 135, 136]);
    expect(chain.edges).toHaveLength(3);
    expect(chain.isBranching).toBe(true);
  });

  it('only the current Pokémon stage is marked current in a branching chain', () => {
    const chain = parseEvolutionChain(eeveeChain, 134);
    expect(chain.stages.find((s) => s.pokemonId === 134)?.isCurrent).toBe(true);
    expect(chain.stages.find((s) => s.pokemonId === 135)?.isCurrent).toBe(false);
    expect(chain.stages.find((s) => s.pokemonId === 136)?.isCurrent).toBe(false);
  });

  it('preserves PokeAPI source order for siblings', () => {
    const chain = parseEvolutionChain(eeveeChain, 134);
    expect(chain.edges.map((e) => e.toPokemonId)).toEqual([134, 135, 136]);
  });
});

describe('parseEvolutionChain — no evolutions', () => {
  it('Tauros → 1 stage, 0 edges, hasNoEvolutions=true', () => {
    const chain = parseEvolutionChain(taurosChain, 128);
    expect(chain.stages).toHaveLength(1);
    expect(chain.edges).toHaveLength(0);
    expect(chain.hasNoEvolutions).toBe(true);
  });
});
