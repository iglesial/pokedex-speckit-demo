import type { PokemonSummary, PokemonType } from '../types/pokemon';

export function matchesQuery(summary: PokemonSummary, q: string): boolean {
  const trimmed = q.trim();
  if (trimmed === '') return true;
  if (/^\d+$/.test(trimmed)) {
    return summary.id === parseInt(trimmed, 10);
  }
  return summary.name.toLowerCase().includes(trimmed.toLowerCase());
}

export function matchesTypes(
  summary: PokemonSummary,
  types: Set<PokemonType>,
): boolean {
  if (types.size === 0) return true;
  for (const t of types) if (!summary.types.includes(t)) return false;
  return true;
}
