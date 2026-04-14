import type { BaseStats } from '../types/pokemon';
import { STAT_BANDS } from '../config/catalog';

const LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Atk',
  specialDefense: 'Sp. Def',
  speed: 'Speed',
};

export function statLabel(key: keyof BaseStats): string {
  return LABELS[key];
}

export function statBand(value: number): 'low' | 'mid' | 'high' {
  if (value < STAT_BANDS.low) return 'low';
  if (value < STAT_BANDS.mid) return 'mid';
  return 'high';
}

export const STAT_KEYS: (keyof BaseStats)[] = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];
