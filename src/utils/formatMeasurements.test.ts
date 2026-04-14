import { describe, it, expect } from 'vitest';
import { formatHeight, formatWeight } from './formatMeasurements';

describe('formatHeight', () => {
  it('converts decimetres to metres with one decimal', () => {
    expect(formatHeight(7)).toBe('0.7 m');
    expect(formatHeight(17)).toBe('1.7 m');
    expect(formatHeight(0)).toBe('0.0 m');
    expect(formatHeight(100)).toBe('10.0 m');
  });
});

describe('formatWeight', () => {
  it('converts hectograms to kilograms with one decimal', () => {
    expect(formatWeight(905)).toBe('90.5 kg');
    expect(formatWeight(1)).toBe('0.1 kg');
    expect(formatWeight(0)).toBe('0.0 kg');
    expect(formatWeight(10000)).toBe('1000.0 kg');
  });
});
