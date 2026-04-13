import type { HTMLAttributes } from 'react';
import type { PokemonType } from '../../../types/pokemon';
import { cx } from '../../../utils/classNames';
import './TypeBadge.css';

export interface TypeBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type: PokemonType;
}

export function TypeBadge({ type, className, ...rest }: TypeBadgeProps) {
  const title = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span
      {...rest}
      data-type={type}
      className={cx('type-badge', className)}
    >
      {title}
    </span>
  );
}
