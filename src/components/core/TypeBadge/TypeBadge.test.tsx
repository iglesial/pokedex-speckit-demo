import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypeBadge } from './TypeBadge';

describe('<TypeBadge>', () => {
  it('renders title-cased type name', () => {
    render(<TypeBadge type="fire" />);
    expect(screen.getByText('Fire')).toBeInTheDocument();
  });

  it('applies data-type so CSS can color per type', () => {
    render(<TypeBadge type="water" />);
    const el = screen.getByText('Water');
    expect(el.getAttribute('data-type')).toBe('water');
    expect(el).toHaveClass('type-badge');
  });
});
