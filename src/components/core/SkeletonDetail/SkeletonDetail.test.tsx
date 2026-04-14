import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonDetail } from './SkeletonDetail';

describe('<SkeletonDetail>', () => {
  it('sets aria-busy to announce loading', () => {
    render(<SkeletonDetail />);
    expect(screen.getByTestId('skeleton-detail')).toHaveAttribute('aria-busy', 'true');
  });

  it('includes a visually-hidden status text for screen readers', () => {
    render(<SkeletonDetail />);
    expect(screen.getByText('Loading Pokémon details')).toBeInTheDocument();
  });
});
