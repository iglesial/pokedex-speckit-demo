export interface EvolutionTriggerLabel {
  short: string;
  accessible: string;
}

interface EvolutionDetail {
  trigger?: { name?: string };
  min_level?: number | null;
  min_happiness?: number | null;
  item?: { name?: string } | null;
  [k: string]: unknown;
}

function titleCase(kebab: string): string {
  return kebab
    .split('-')
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

export function formatEvolutionTrigger(
  details: EvolutionDetail[],
): EvolutionTriggerLabel | null {
  if (!details || details.length === 0) return null;
  const d = details[0];
  const trigger = d.trigger?.name;

  if (trigger === 'level-up') {
    if (typeof d.min_level === 'number') {
      return {
        short: `Lv. ${d.min_level}`,
        accessible: `evolves at level ${d.min_level}`,
      };
    }
    if (typeof d.min_happiness === 'number') {
      return {
        short: 'Friendship',
        accessible: 'evolves with high friendship',
      };
    }
    return null;
  }

  if (trigger === 'use-item' && d.item?.name) {
    const label = titleCase(d.item.name);
    return {
      short: label,
      accessible: `evolves when given ${label}`,
    };
  }

  if (trigger === 'trade') {
    return {
      short: 'Trade',
      accessible: 'evolves when traded',
    };
  }

  return null;
}
