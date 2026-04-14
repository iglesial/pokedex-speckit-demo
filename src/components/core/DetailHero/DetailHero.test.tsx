import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailHero } from './DetailHero';
import type { PokemonDetail } from '../../../types/pokemon';

const charizard: PokemonDetail = {
  id: 6,
  name: 'charizard',
  types: ['fire', 'flying'],
  artworkUrl: 'https://artwork/6.png',
  stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
  heightDecimetres: 17,
  weightHectograms: 905,
  abilities: [],
  flavorText: null,
};

describe('<DetailHero>', () => {
  it('renders name in <h1>, #NNN id, both type badges, and formatted dimensions', () => {
    render(<DetailHero pokemon={charizard} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Charizard' })).toBeInTheDocument();
    expect(screen.getByText('#006')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Flying')).toBeInTheDocument();
    expect(screen.getByText('1.7 m')).toBeInTheDocument();
    expect(screen.getByText('90.5 kg')).toBeInTheDocument();
  });

  it('renders artwork image when artworkUrl is present', () => {
    render(<DetailHero pokemon={charizard} />);
    const img = screen.getByRole('img', { name: /Charizard artwork/ }) as HTMLImageElement;
    expect(img.src).toBe('https://artwork/6.png');
  });

  it('falls back to a placeholder when artworkUrl is null', () => {
    render(<DetailHero pokemon={{ ...charizard, artworkUrl: null }} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders only one type badge for a single-type Pokémon', () => {
    const pikachu: PokemonDetail = {
      ...charizard,
      id: 25, name: 'pikachu', types: ['electric'], artworkUrl: null,
    };
    render(<DetailHero pokemon={pikachu} />);
    expect(screen.getByText('Electric')).toBeInTheDocument();
    expect(screen.queryByText('Fire')).not.toBeInTheDocument();
  });
});
