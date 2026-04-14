import './SkeletonEvolution.css';

export interface SkeletonEvolutionProps {}

export function SkeletonEvolution(_: SkeletonEvolutionProps) {
  return (
    <div className="skeleton-evolution" aria-busy="true" data-testid="skeleton-evolution">
      <span className="skeleton-evolution__sr-only">Loading evolution chain</span>
      <div className="skeleton-evolution__card" />
      <div className="skeleton-evolution__arrow" />
      <div className="skeleton-evolution__card" />
      <div className="skeleton-evolution__arrow" />
      <div className="skeleton-evolution__card" />
    </div>
  );
}
