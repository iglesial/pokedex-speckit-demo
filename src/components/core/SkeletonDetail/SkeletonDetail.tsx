import './SkeletonDetail.css';

export interface SkeletonDetailProps {}

export function SkeletonDetail(_: SkeletonDetailProps) {
  return (
    <div className="skeleton-detail" aria-busy="true" data-testid="skeleton-detail">
      <span className="skeleton-detail__sr-only">Loading Pokémon details</span>
      <div className="skeleton-detail__hero">
        <div className="skeleton-detail__art" />
        <div className="skeleton-detail__meta">
          <div className="skeleton-detail__line skeleton-detail__line--short" />
          <div className="skeleton-detail__line skeleton-detail__line--title" />
          <div className="skeleton-detail__line" />
        </div>
      </div>
      <div className="skeleton-detail__stats">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-detail__stat" />
        ))}
      </div>
      <div className="skeleton-detail__block" />
      <div className="skeleton-detail__block skeleton-detail__block--tall" />
    </div>
  );
}
