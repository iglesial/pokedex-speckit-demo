import { http, HttpResponse } from 'msw';
import { POKEAPI_BASE } from '../../config/catalog';
import type { PokemonType } from '../../types/pokemon';

interface FixtureEntry {
  id: number;
  name: string;
  types: PokemonType[];
}

/**
 * Minimal Gen-1 fixtures covering the IDs asserted in tests plus enough
 * Fire-type and Fire+Flying representatives for filter tests.
 *
 * For IDs not listed here, the handler synthesizes a neutral "normal" entry
 * so paging logic can be tested across all 151 slots without hand-writing
 * every Pokémon.
 */
const FIXTURES: FixtureEntry[] = [
  { id: 1, name: 'bulbasaur', types: ['grass', 'poison'] },
  { id: 4, name: 'charmander', types: ['fire'] },
  { id: 5, name: 'charmeleon', types: ['fire'] },
  { id: 6, name: 'charizard', types: ['fire', 'flying'] },
  { id: 7, name: 'squirtle', types: ['water'] },
  { id: 25, name: 'pikachu', types: ['electric'] },
  { id: 37, name: 'vulpix', types: ['fire'] },
  { id: 38, name: 'ninetales', types: ['fire'] },
  { id: 58, name: 'growlithe', types: ['fire'] },
  { id: 59, name: 'arcanine', types: ['fire'] },
  { id: 77, name: 'ponyta', types: ['fire'] },
  { id: 78, name: 'rapidash', types: ['fire'] },
  { id: 126, name: 'magmar', types: ['fire'] },
  { id: 133, name: 'eevee', types: ['normal'] },
  { id: 136, name: 'flareon', types: ['fire'] },
  { id: 146, name: 'moltres', types: ['fire', 'flying'] },
  { id: 150, name: 'mewtwo', types: ['psychic'] },
  { id: 151, name: 'mew', types: ['psychic'] },
];

function fixtureFor(id: number): FixtureEntry {
  return FIXTURES.find((f) => f.id === id) ?? { id, name: `pokemon-${id}`, types: ['normal'] };
}

export const handlers = [
  http.get(`${POKEAPI_BASE}/pokemon`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    const results = Array.from({ length: limit }, (_, i) => {
      const id = offset + i + 1;
      return { name: fixtureFor(id).name, url: `${POKEAPI_BASE}/pokemon/${id}/` };
    });
    return HttpResponse.json({ count: 151, results });
  }),

  http.get(`${POKEAPI_BASE}/pokemon/:id`, ({ params }) => {
    const id = Number(params.id);
    const f = fixtureFor(id);
    return HttpResponse.json({
      id,
      name: f.name,
      types: f.types.map((type, i) => ({ slot: i + 1, type: { name: type } })),
      sprites: {
        front_default: `https://sprite/${id}.png`,
        other: {
          'official-artwork': {
            front_default: `https://artwork/${id}.png`,
          },
        },
      },
    });
  }),

  http.get(`${POKEAPI_BASE}/type`, () => {
    return HttpResponse.json({
      results: [
        ...['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']
          .map((n) => ({ name: n, url: `${POKEAPI_BASE}/type/${n}/` })),
        { name: 'unknown', url: `${POKEAPI_BASE}/type/unknown/` },
        { name: 'shadow', url: `${POKEAPI_BASE}/type/shadow/` },
      ],
    });
  }),
];
