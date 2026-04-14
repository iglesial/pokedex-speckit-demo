import { http, HttpResponse } from 'msw';
import { POKEAPI_BASE } from '../../config/catalog';
import type { PokemonType } from '../../types/pokemon';

interface FixtureEntry {
  id: number;
  name: string;
  types: PokemonType[];
  stats?: {
    hp: number; attack: number; defense: number;
    specialAttack: number; specialDefense: number; speed: number;
  };
  heightDecimetres?: number;
  weightHectograms?: number;
  abilities?: { name: string; isHidden: boolean }[];
  flavor?: { en: string[]; other: string[] } | null;
}

const FIXTURES: FixtureEntry[] = [
  {
    id: 1, name: 'bulbasaur', types: ['grass', 'poison'],
    stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    heightDecimetres: 7, weightHectograms: 69,
    abilities: [{ name: 'overgrow', isHidden: false }, { name: 'chlorophyll', isHidden: true }],
    flavor: { en: ['A strange seed was\nplanted on its\fback at birth.'], other: [] },
  },
  { id: 4, name: 'charmander', types: ['fire'] },
  { id: 5, name: 'charmeleon', types: ['fire'] },
  {
    id: 6, name: 'charizard', types: ['fire', 'flying'],
    stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    heightDecimetres: 17, weightHectograms: 905,
    abilities: [{ name: 'blaze', isHidden: false }, { name: 'solar-power', isHidden: true }],
    flavor: { en: ['Spits fire that\u00A0is hot enough to\u000Cmelt boulders.'], other: ['FR text'] },
  },
  { id: 7, name: 'squirtle', types: ['water'] },
  {
    id: 25, name: 'pikachu', types: ['electric'],
    stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
    heightDecimetres: 4, weightHectograms: 60,
    abilities: [{ name: 'static', isHidden: false }, { name: 'lightning-rod', isHidden: true }],
    flavor: { en: ['When several of these pokemon gather, their electricity could build and cause lightning storms.'], other: [] },
  },
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
  {
    id: 150, name: 'mewtwo', types: ['psychic'],
    stats: { hp: 106, attack: 110, defense: 90, specialAttack: 154, specialDefense: 90, speed: 130 },
    heightDecimetres: 20, weightHectograms: 1220,
    abilities: [{ name: 'pressure', isHidden: false }, { name: 'unnerve', isHidden: true }],
    flavor: { en: [], other: ['JP only'] }, // no English → null flavor
  },
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
    if (id < 1 || id > 151) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    const f = fixtureFor(id);
    return HttpResponse.json({
      id,
      name: f.name,
      height: f.heightDecimetres ?? 5,
      weight: f.weightHectograms ?? 100,
      types: f.types.map((type, i) => ({ slot: i + 1, type: { name: type } })),
      sprites: {
        front_default: `https://sprite/${id}.png`,
        other: {
          'official-artwork': { front_default: `https://artwork/${id}.png` },
        },
      },
      stats: (
        f.stats
          ? [
              { base_stat: f.stats.hp, stat: { name: 'hp' } },
              { base_stat: f.stats.attack, stat: { name: 'attack' } },
              { base_stat: f.stats.defense, stat: { name: 'defense' } },
              { base_stat: f.stats.specialAttack, stat: { name: 'special-attack' } },
              { base_stat: f.stats.specialDefense, stat: { name: 'special-defense' } },
              { base_stat: f.stats.speed, stat: { name: 'speed' } },
            ]
          : [
              { base_stat: 50, stat: { name: 'hp' } },
              { base_stat: 50, stat: { name: 'attack' } },
              { base_stat: 50, stat: { name: 'defense' } },
              { base_stat: 50, stat: { name: 'special-attack' } },
              { base_stat: 50, stat: { name: 'special-defense' } },
              { base_stat: 50, stat: { name: 'speed' } },
            ]
      ),
      abilities: (f.abilities ?? [{ name: 'placeholder', isHidden: false }]).map((a, i) => ({
        ability: { name: a.name },
        is_hidden: a.isHidden,
        slot: i + 1,
      })),
    });
  }),

  http.get(`${POKEAPI_BASE}/pokemon-species/:id`, ({ params }) => {
    const id = Number(params.id);
    if (id < 1 || id > 151) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    const f = fixtureFor(id);
    const flavor = f.flavor ?? { en: [`Placeholder flavor for ${f.name}.`], other: [] };
    const flavorEntries = [
      ...flavor.en.map((text) => ({
        flavor_text: text,
        language: { name: 'en' },
        version: { name: 'red' },
      })),
      ...flavor.other.map((text) => ({
        flavor_text: text,
        language: { name: 'fr' },
        version: { name: 'red' },
      })),
    ];
    return HttpResponse.json({
      id,
      name: f.name,
      flavor_text_entries: flavorEntries,
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
