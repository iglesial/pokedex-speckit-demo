import './EvolutionEdge.css';

export interface EvolutionEdgeProps {
  triggerLabel: string | null;
  accessibleLabel: string | null;
  orientation?: 'horizontal' | 'vertical';
}

export function EvolutionEdge({
  triggerLabel,
  accessibleLabel,
  orientation,
}: EvolutionEdgeProps) {
  return (
    <div
      className="evolution-edge"
      role="img"
      aria-label={accessibleLabel ?? 'evolves'}
      data-orientation={orientation ?? 'auto'}
    >
      <span className="evolution-edge__arrow" aria-hidden="true">
        →
      </span>
      {triggerLabel && <span className="evolution-edge__label">{triggerLabel}</span>}
    </div>
  );
}
