import { describe, it, expect } from 'vitest';
import { formatEvolutionTrigger } from './formatEvolutionTrigger';

describe('formatEvolutionTrigger', () => {
  it('level-up with min_level → "Lv. N"', () => {
    expect(formatEvolutionTrigger([{ trigger: { name: 'level-up' }, min_level: 16 }])).toEqual({
      short: 'Lv. 16',
      accessible: 'evolves at level 16',
    });
  });

  it('use-item with item → title-cased item label', () => {
    expect(
      formatEvolutionTrigger([{ trigger: { name: 'use-item' }, item: { name: 'fire-stone' } }]),
    ).toEqual({ short: 'Fire Stone', accessible: 'evolves when given Fire Stone' });
    expect(
      formatEvolutionTrigger([{ trigger: { name: 'use-item' }, item: { name: 'water-stone' } }]),
    ).toEqual({ short: 'Water Stone', accessible: 'evolves when given Water Stone' });
  });

  it('trade → "Trade"', () => {
    expect(formatEvolutionTrigger([{ trigger: { name: 'trade' } }])).toEqual({
      short: 'Trade',
      accessible: 'evolves when traded',
    });
  });

  it('level-up with min_happiness → "Friendship"', () => {
    expect(
      formatEvolutionTrigger([{ trigger: { name: 'level-up' }, min_happiness: 220 }]),
    ).toEqual({ short: 'Friendship', accessible: 'evolves with high friendship' });
  });

  it('empty details → null', () => {
    expect(formatEvolutionTrigger([])).toBeNull();
  });

  it('unknown trigger → null', () => {
    expect(formatEvolutionTrigger([{ trigger: { name: 'shed' } }])).toBeNull();
  });

  it('uses only the first detail entry', () => {
    expect(
      formatEvolutionTrigger([
        { trigger: { name: 'level-up' }, min_level: 25 },
        { trigger: { name: 'trade' } },
      ]),
    ).toEqual({ short: 'Lv. 25', accessible: 'evolves at level 25' });
  });
});
