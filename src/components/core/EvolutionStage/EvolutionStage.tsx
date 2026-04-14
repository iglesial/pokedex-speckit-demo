import { Link } from 'react-router-dom';
import type { EvolutionStage as EvolutionStageModel } from '../../../types/pokemon';
import { cx } from '../../../utils/classNames';
import './EvolutionStage.css';

export interface EvolutionStageProps {
  stage: EvolutionStageModel;
  index?: number;
}

function titleCase(kebab: string): string {
  return kebab
    .split('-')
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

function Content({ stage }: { stage: EvolutionStageModel }) {
  return (
    <>
      <div className="evolution-stage__art">
        {stage.spriteUrl ? (
          <img src={stage.spriteUrl} alt="" loading="lazy" />
        ) : (
          <div className="evolution-stage__art-placeholder" aria-hidden="true" />
        )}
      </div>
      <span className="evolution-stage__id">{formatId(stage.pokemonId)}</span>
      <span className="evolution-stage__name">{titleCase(stage.name)}</span>
    </>
  );
}

export function EvolutionStage({ stage, index = 0 }: EvolutionStageProps) {
  const style = { '--stage-index': index } as React.CSSProperties;
  if (stage.isCurrent) {
    return (
      <div
        className={cx('evolution-stage', 'evolution-stage--current')}
        aria-current="page"
        aria-label={`${titleCase(stage.name)}, current Pokémon`}
        data-pokemon-id={stage.pokemonId}
        style={style}
      >
        <Content stage={stage} />
      </div>
    );
  }
  return (
    <Link
      to={`/pokemon/${stage.pokemonId}`}
      className="evolution-stage"
      aria-label={titleCase(stage.name)}
      data-pokemon-id={stage.pokemonId}
      style={style}
    >
      <Content stage={stage} />
    </Link>
  );
}
