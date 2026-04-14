import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getPokemonDetail, PokemonNotFoundError } from '../../services/pokeapi';
import { DetailHero } from '../../components/core/DetailHero/DetailHero';
import { StatBar } from '../../components/core/StatBar/StatBar';
import { AbilityList } from '../../components/core/AbilityList/AbilityList';
import { SkeletonDetail } from '../../components/core/SkeletonDetail/SkeletonDetail';
import { ErrorState } from '../../components/core/ErrorState/ErrorState';
import { NotFoundState } from '../../components/core/NotFoundState/NotFoundState';
import { BackButton } from '../../components/core/BackButton/BackButton';
import { GEN1_RANGE } from '../../config/catalog';
import { STAT_KEYS, statLabel } from '../../utils/formatStat';
import type { PokemonDetail } from '../../types/pokemon';
import './DetailPage.css';

function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n < GEN1_RANGE.min || n > GEN1_RANGE.max) return null;
  return n;
}

export function DetailPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const parsedId = parseId(rawId);

  const { data, isPending, isError, error, refetch } = useQuery<PokemonDetail>({
    queryKey: ['pokemon-detail', parsedId],
    queryFn: () => getPokemonDetail(parsedId as number),
    enabled: parsedId !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const isNotFound = parsedId === null || (isError && error instanceof PokemonNotFoundError);

  return (
    <div className="detail">
      <div className="detail__top">
        <BackButton />
      </div>

      {isNotFound ? (
        <NotFoundState id={rawId} />
      ) : isError ? (
        <ErrorState
          message="Couldn't load this Pokémon."
          onRetry={() => refetch()}
        />
      ) : isPending || !data ? (
        <SkeletonDetail />
      ) : (
        <>
          <DetailHero pokemon={data} />

          <section className="detail__section detail__section--stats" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="detail__section-title">Base stats</h2>
            <div className="detail__stats">
              {STAT_KEYS.map((key) => (
                <StatBar key={key} label={statLabel(key)} value={data.stats[key]} />
              ))}
            </div>
          </section>

          <section className="detail__section" aria-labelledby="abilities-heading">
            <h2 id="abilities-heading" className="detail__section-title">Abilities</h2>
            <AbilityList abilities={data.abilities} />
          </section>

          {data.flavorText && (
            <section className="detail__section" aria-labelledby="flavor-heading">
              <h2 id="flavor-heading" className="detail__section-title">Pokédex entry</h2>
              <p className="detail__flavor">{data.flavorText}</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
