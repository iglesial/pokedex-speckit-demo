import type { PokemonType } from '../../../types/pokemon';
import { cx } from '../../../utils/classNames';
import './TypeFilterChip.css';

export interface TypeFilterChipProps {
  type: PokemonType;
  active: boolean;
  disabled?: boolean;
  onToggle: (type: PokemonType) => void;
}

export function TypeFilterChip({ type, active, disabled, onToggle }: TypeFilterChipProps) {
  const title = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      data-type={type}
      className={cx(
        'type-filter-chip',
        active && 'type-filter-chip--active',
        disabled && 'type-filter-chip--disabled',
      )}
      style={{ '--chip-color': `var(--type-${type})` } as React.CSSProperties}
      onClick={() => !disabled && onToggle(type)}
    >
      {title}
    </button>
  );
}
