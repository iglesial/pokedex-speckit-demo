import type { PokemonType } from '../../../types/pokemon';
import { TYPE_LIST } from '../../../config/catalog';
import { TypeFilterChip } from '../TypeFilterChip/TypeFilterChip';
import './TypeFilterBar.css';

export interface TypeFilterBarProps {
  active: Set<PokemonType>;
  onChange: (next: Set<PokemonType>) => void;
}

export function TypeFilterBar({ active, onChange }: TypeFilterBarProps) {
  const toggle = (type: PokemonType) => {
    const next = new Set(active);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    onChange(next);
  };
  return (
    <div className="type-filter-bar" role="group" aria-label="Filter by type">
      <ul className="type-filter-bar__chips">
        {TYPE_LIST.map((t) => (
          <li key={t}>
            <TypeFilterChip type={t} active={active.has(t)} onToggle={toggle} />
          </li>
        ))}
      </ul>
      {active.size > 0 && (
        <button
          type="button"
          className="type-filter-bar__reset"
          onClick={() => onChange(new Set())}
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
