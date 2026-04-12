import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { POKEAPI_BASE } from '../config/catalog';
import { listGen1Summaries, listTypes, PokeApiError } from './pokeapi';

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
    // other Pokémon still hydrated
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
