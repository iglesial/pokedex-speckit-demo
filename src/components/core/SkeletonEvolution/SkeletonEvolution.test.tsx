import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonEvolution } from './SkeletonEvolution';

describe('<SkeletonEvolution>', () => {
  it('sets aria-busy to announce loading', () => {
    render(<SkeletonEvolution />);
    expect(screen.getByTestId('skeleton-evolution')).toHaveAttribute('aria-busy', 'true');
  });

  it('includes a visually-hidden status text for screen readers', () => {
    render(<SkeletonEvolution />);
    expect(screen.getByText('Loading evolution chain')).toBeInTheDocument();
  });
});
