import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBar } from './StatBar';

function getFill(container: HTMLElement): HTMLElement {
  return container.querySelector('.stat-bar__fill') as HTMLElement;
}

describe('<StatBar>', () => {
  it('renders label, value, and aria-label with "<label> <value> out of <max>"', () => {
    render(<StatBar label="HP" value={78} />);
    expect(screen.getByLabelText('HP 78 out of 255')).toBeInTheDocument();
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  it('computes width from value / max * 100', () => {
    const { container, rerender } = render(<StatBar label="HP" value={0} />);
    expect(getFill(container).style.width).toBe('0%');
    rerender(<StatBar label="HP" value={50} />);
    expect(getFill(container).style.width).toBe(`${50 / 255 * 100}%`);
    rerender(<StatBar label="HP" value={255} />);
    expect(getFill(container).style.width).toBe('100%');
  });

  it('clamps value > max to 100%', () => {
    const { container } = render(<StatBar label="HP" value={300} />);
    expect(getFill(container).style.width).toBe('100%');
  });

  it('applies correct data-band attribute', () => {
    const { container, rerender } = render(<StatBar label="HP" value={40} />);
    expect(getFill(container).getAttribute('data-band')).toBe('low');
    rerender(<StatBar label="HP" value={75} />);
    expect(getFill(container).getAttribute('data-band')).toBe('mid');
    rerender(<StatBar label="HP" value={150} />);
    expect(getFill(container).getAttribute('data-band')).toBe('high');
  });
});
