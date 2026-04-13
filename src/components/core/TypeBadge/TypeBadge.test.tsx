import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypeBadge } from './TypeBadge';

describe('<TypeBadge>', () => {
  it('renders title-cased type name', () => {
    render(<TypeBadge type="fire" />);
    expect(screen.getByText('Fire')).toBeInTheDocument();
  });

  it('applies the tokenized color', () => {
    render(<TypeBadge type="water" />);
    const el = screen.getByText('Water');
    expect(el.getAttribute('style')).toContain('var(--type-water)');
    expect(el.getAttribute('data-type')).toBe('water');
  });
});
