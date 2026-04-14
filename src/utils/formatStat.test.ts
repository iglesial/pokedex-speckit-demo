import { describe, it, expect } from 'vitest';
import { statLabel, statBand } from './formatStat';

describe('statLabel', () => {
  it('returns display labels', () => {
    expect(statLabel('hp')).toBe('HP');
    expect(statLabel('specialAttack')).toBe('Sp. Atk');
    expect(statLabel('specialDefense')).toBe('Sp. Def');
    expect(statLabel('speed')).toBe('Speed');
  });
});

describe('statBand', () => {
  it('returns "low" for values below 50', () => {
    expect(statBand(0)).toBe('low');
    expect(statBand(49)).toBe('low');
  });
  it('returns "mid" for values 50..99', () => {
    expect(statBand(50)).toBe('mid');
    expect(statBand(99)).toBe('mid');
  });
  it('returns "high" for values 100+', () => {
    expect(statBand(100)).toBe('high');
    expect(statBand(255)).toBe('high');
  });
});
