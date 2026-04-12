import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Card } from './Card';
import type { PokemonSummary } from '../../../types/pokemon';

const pikachu: PokemonSummary = {
  id: 25,
  name: 'pikachu',
  types: ['electric'],
  spriteUrl: 'https://artwork/25.png',
};

function renderInRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('<Card>', () => {
  it('renders sprite, title-cased name, #025 id, and type badges', () => {
    renderInRouter(<Card pokemon={pikachu} />);
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('#025')).toBeInTheDocument();
    expect(screen.getByText('Electric')).toBeInTheDocument();
    const img = screen.getByRole('presentation', { hidden: true }) as HTMLImageElement
      ?? screen.getByAltText('');
    expect((img as HTMLImageElement).src).toBe('https://artwork/25.png');
  });

  it('links to /pokemon/:id', () => {
    renderInRouter(<Card pokemon={pikachu} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/pokemon/25');
    expect(link).toHaveAttribute('data-card-id', '25');
  });

  it('renders SkeletonCard when loading', () => {
    renderInRouter(<Card pokemon={pikachu} loading />);
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    expect(screen.queryByText('Pikachu')).not.toBeInTheDocument();
  });

  it('renders without types when not yet hydrated', () => {
    const stub: PokemonSummary = { id: 25, name: 'pikachu', types: [], spriteUrl: null };
    renderInRouter(<Card pokemon={stub} />);
    expect(screen.queryByText('Electric')).not.toBeInTheDocument();
  });
});
