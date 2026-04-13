import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonCard } from './SkeletonCard';

describe('<SkeletonCard>', () => {
  it('renders a skeleton container', () => {
    render(<SkeletonCard />);
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('is aria-hidden so screen readers skip it', () => {
    render(<SkeletonCard />);
    expect(screen.getByTestId('skeleton-card')).toHaveAttribute('aria-hidden', 'true');
  });
});
