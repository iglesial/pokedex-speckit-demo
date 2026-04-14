import type { PokemonDetail } from '../../../types/pokemon';
import { TypeBadge } from '../TypeBadge/TypeBadge';
import { formatHeight, formatWeight } from '../../../utils/formatMeasurements';
import './DetailHero.css';

export interface DetailHeroProps {
  pokemon: PokemonDetail;
}

function titleCase(name: string): string {
  return name
    .split('-')
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function DetailHero({ pokemon }: DetailHeroProps) {
  return (
    <div className="detail-hero">
      <div className="detail-hero__art">
        {pokemon.artworkUrl ? (
          <img
            className="detail-hero__img"
            src={pokemon.artworkUrl}
            alt={`${titleCase(pokemon.name)} artwork`}
          />
        ) : (
          <div className="detail-hero__art-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="detail-hero__meta">
        <span className="detail-hero__id">{formatId(pokemon.id)}</span>
        <h1 className="detail-hero__name">{titleCase(pokemon.name)}</h1>
        <div className="detail-hero__types">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        <dl className="detail-hero__dimensions">
          <div>
            <dt>Height</dt>
            <dd>{formatHeight(pokemon.heightDecimetres)}</dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{formatWeight(pokemon.weightHectograms)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
