import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import type { PokemonSummary } from '../../../types/pokemon';
import { cx } from '../../../utils/classNames';
import { TypeBadge } from '../TypeBadge/TypeBadge';
import { SkeletonCard } from '../SkeletonCard/SkeletonCard';
import './Card.css';

export interface CardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  pokemon: PokemonSummary;
  loading?: boolean;
  onFocusCard?: (id: number) => void;
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

function titleCase(name: string): string {
  return name
    .split('-')
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

export const Card = forwardRef<HTMLAnchorElement, CardProps>(function Card(
  { pokemon, loading, className, onFocusCard, onFocus, ...rest },
  ref,
) {
  if (loading) return <SkeletonCard />;
  const hydrated = pokemon.spriteUrl != null && pokemon.types.length > 0;
  return (
    <Link
      ref={ref}
      to={`/pokemon/${pokemon.id}`}
      data-card-id={pokemon.id}
      className={cx('card', className)}
      onFocus={(e) => {
        onFocusCard?.(pokemon.id);
        onFocus?.(e);
      }}
      {...rest}
    >
      <div className="card__art">
        {hydrated && pokemon.spriteUrl ? (
          <img src={pokemon.spriteUrl} alt="" loading="lazy" />
        ) : (
          <div className="card__art-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="card__meta">
        <span className="card__id">{formatId(pokemon.id)}</span>
        <h3 className="card__name">{titleCase(pokemon.name)}</h3>
        {pokemon.types.length > 0 && (
          <div className="card__types">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
});
