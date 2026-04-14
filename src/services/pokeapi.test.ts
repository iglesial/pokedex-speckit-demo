import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { POKEAPI_BASE } from '../config/catalog';
import {
  listGen1Summaries,
  listTypes,
  getPokemonDetail,
  PokeApiError,
  PokemonNotFoundError,
} from './pokeapi';

describe('listGen1Summaries', () => {
  it('returns 151 summaries', async () => {
    const all = await listGen1Summaries();
    expect(all).toHaveLength(151);
  });

  it('hydrates sprite and types from per-id fetch', async () => {
    const all = await listGen1Summaries();
    const pikachu = all.find((p) => p.id === 25);
    expect(pikachu).toBeDefined();
    expect(pikachu!.name).toBe('pikachu');
    expect(pikachu!.types).toEqual(['electric']);
    expect(pikachu!.spriteUrl).toBe('https://artwork/25.png');
  });

  it('degrades to stub when a single Pokémon fetch fails', async () => {
    server.use(
      http.get(`${POKEAPI_BASE}/pokemon/25`, () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    const all = await listGen1Summaries();
    const pikachu = all.find((p) => p.id === 25);
    expect(pikachu).toBeDefined();
    expect(pikachu!.types).toEqual([]);
    expect(pikachu!.spriteUrl).toBeNull();
    const charizard = all.find((p) => p.id === 6);
    expect(charizard!.types).toEqual(['fire', 'flying']);
  });
});

describe('listTypes', () => {
  it('returns the 18 canonical types, filtering unknown/shadow', async () => {
    const types = await listTypes();
    expect(types).toHaveLength(18);
    expect(types).toContain('fire');
    expect(types).not.toContain('unknown');
    expect(types).not.toContain('shadow');
  });

  it('throws PokeApiError on network failure', async () => {
    server.use(
      http.get(`${POKEAPI_BASE}/type`, () => HttpResponse.json({}, { status: 500 })),
    );
    await expect(listTypes()).rejects.toBeInstanceOf(PokeApiError);
  });
});

describe('getPokemonDetail', () => {
  it('returns a PokemonDetail for a valid id', async () => {
    const charizard = await getPokemonDetail(6);
    expect(charizard.id).toBe(6);
    expect(charizard.name).toBe('charizard');
    expect(charizard.types).toEqual(['fire', 'flying']);
    expect(charizard.stats.specialAttack).toBe(109);
    expect(charizard.heightDecimetres).toBe(17);
    expect(charizard.weightHectograms).toBe(905);
    expect(charizard.abilities).toEqual([
      { name: 'blaze', isHidden: false },
      { name: 'solar-power', isHidden: true },
    ]);
    expect(charizard.artworkUrl).toBe('https://artwork/6.png');
  });

  it('normalizes flavor text (strips form-feed, NBSP, newlines)', async () => {
    const charizard = await getPokemonDetail(6);
    expect(charizard.flavorText).toBe(
      'Spits fire that is hot enough to melt boulders.',
    );
  });

  it('returns null flavorText when no English entry exists', async () => {
    const mewtwo = await getPokemonDetail(150);
    expect(mewtwo.flavorText).toBeNull();
  });

  it('throws PokemonNotFoundError for out-of-range id without firing a request', async () => {
    let called = false;
    server.use(
      http.get(`${POKEAPI_BASE}/pokemon/:id`, () => {
        called = true;
        return HttpResponse.json({}, { status: 200 });
      }),
    );
    await expect(getPokemonDetail(999)).rejects.toBeInstanceOf(PokemonNotFoundError);
    await expect(getPokemonDetail(0)).rejects.toBeInstanceOf(PokemonNotFoundError);
    await expect(getPokemonDetail(-1)).rejects.toBeInstanceOf(PokemonNotFoundError);
    expect(called).toBe(false);
  });

  it('throws PokemonNotFoundError on upstream 404', async () => {
    server.use(
      http.get(`${POKEAPI_BASE}/pokemon/50`, () =>
        HttpResponse.json({ error: 'not found' }, { status: 404 }),
      ),
    );
    await expect(getPokemonDetail(50)).rejects.toBeInstanceOf(PokemonNotFoundError);
  });

  it('propagates non-404 upstream errors', async () => {
    server.use(
      http.get(`${POKEAPI_BASE}/pokemon/25`, () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    await expect(getPokemonDetail(25)).rejects.toBeInstanceOf(PokeApiError);
  });
});
