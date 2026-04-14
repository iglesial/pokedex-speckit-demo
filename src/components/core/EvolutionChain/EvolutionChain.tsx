import { useQuery } from '@tanstack/react-query';
import { getEvolutionChain } from '../../../services/pokeapi';
import { EvolutionStage } from '../EvolutionStage/EvolutionStage';
import { EvolutionEdge } from '../EvolutionEdge/EvolutionEdge';
import { SkeletonEvolution } from '../SkeletonEvolution/SkeletonEvolution';
import { ErrorState } from '../ErrorState/ErrorState';
import { cx } from '../../../utils/classNames';
import type { EvolutionChain as EvolutionChainModel } from '../../../types/pokemon';
import './EvolutionChain.css';

export interface EvolutionChainProps {
  chainId: number;
  currentPokemonId: number;
}

function EdgeFor({
  chain,
  fromId,
  toId,
}: {
  chain: EvolutionChainModel;
  fromId: number;
  toId: number;
}) {
  const edge = chain.edges.find((e) => e.fromPokemonId === fromId && e.toPokemonId === toId);
  return (
    <EvolutionEdge
      triggerLabel={edge?.triggerLabel ?? null}
      accessibleLabel={edge?.accessibleLabel ?? null}
    />
  );
}

function LinearChain({ chain }: { chain: EvolutionChainModel }) {
  return (
    <div className="evolution-chain__layout evolution-chain__layout--linear">
      {chain.stages.map((stage, idx) => (
        <div key={stage.pokemonId} className="evolution-chain__linear-cell">
          <EvolutionStage stage={stage} index={idx} />
          {idx < chain.stages.length - 1 && (
            <EdgeFor chain={chain} fromId={stage.pokemonId} toId={chain.stages[idx + 1].pokemonId} />
          )}
        </div>
      ))}
    </div>
  );
}

function BranchingChain({ chain }: { chain: EvolutionChainModel }) {
  // First stage = ancestor; all other stages treated as sibling branches.
  const [ancestor, ...branches] = chain.stages;
  return (
    <div className="evolution-chain__layout evolution-chain__layout--branching">
      <div className="evolution-chain__ancestor">
        <EvolutionStage stage={ancestor} index={0} />
      </div>
      <div className="evolution-chain__branches">
        {branches.map((branch, idx) => (
          <div key={branch.pokemonId} className="evolution-chain__branch">
            <EdgeFor chain={chain} fromId={ancestor.pokemonId} toId={branch.pokemonId} />
            <EvolutionStage stage={branch} index={idx + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EvolutionChain({ chainId, currentPokemonId }: EvolutionChainProps) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['evolution-chain', chainId],
    queryFn: () => getEvolutionChain(chainId, currentPokemonId),
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  return (
    <section className={cx('evolution-chain')} aria-labelledby="evolution-heading">
      <h2 id="evolution-heading" className="evolution-chain__heading">Evolution</h2>
      <div className="evolution-chain__body">
        {isPending ? (
          <SkeletonEvolution />
        ) : isError ? (
          <ErrorState
            message="Couldn't load the evolution chain."
            onRetry={() => refetch()}
          />
        ) : data.hasNoEvolutions ? (
          <p className="evolution-chain__no-evo" role="status">
            This Pokémon does not evolve.
          </p>
        ) : data.isBranching ? (
          <BranchingChain chain={data} />
        ) : (
          <LinearChain chain={data} />
        )}
      </div>
    </section>
  );
}
