import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvolutionEdge } from './EvolutionEdge';

describe('<EvolutionEdge>', () => {
  it('renders label when triggerLabel is provided', () => {
    render(<EvolutionEdge triggerLabel="Lv. 16" accessibleLabel="evolves at level 16" />);
    expect(screen.getByText('Lv. 16')).toBeInTheDocument();
  });

  it('omits label when triggerLabel is null', () => {
    const { container } = render(
      <EvolutionEdge triggerLabel={null} accessibleLabel={null} />,
    );
    expect(container.querySelector('.evolution-edge__label')).toBeNull();
  });

  it('uses accessibleLabel as the aria-label', () => {
    render(<EvolutionEdge triggerLabel="Lv. 16" accessibleLabel="evolves at level 16" />);
    expect(screen.getByLabelText('evolves at level 16')).toBeInTheDocument();
  });

  it('falls back to "evolves" when accessibleLabel is null', () => {
    render(<EvolutionEdge triggerLabel={null} accessibleLabel={null} />);
    expect(screen.getByLabelText('evolves')).toBeInTheDocument();
  });

  it('has role="img" so screen readers treat it as a single phrase', () => {
    render(<EvolutionEdge triggerLabel="Trade" accessibleLabel="evolves when traded" />);
    expect(screen.getByRole('img', { name: 'evolves when traded' })).toBeInTheDocument();
  });

  it('sets data-orientation from the orientation prop', () => {
    const { container: h } = render(
      <EvolutionEdge triggerLabel={null} accessibleLabel={null} orientation="horizontal" />,
    );
    expect(h.querySelector('.evolution-edge')?.getAttribute('data-orientation')).toBe('horizontal');
    const { container: v } = render(
      <EvolutionEdge triggerLabel={null} accessibleLabel={null} orientation="vertical" />,
    );
    expect(v.querySelector('.evolution-edge')?.getAttribute('data-orientation')).toBe('vertical');
  });
});
