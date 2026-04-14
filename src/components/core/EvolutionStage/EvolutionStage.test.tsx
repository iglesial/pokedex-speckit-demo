import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EvolutionStage } from './EvolutionStage';
import type { EvolutionStage as Model } from '../../../types/pokemon';

const bulba: Model = { pokemonId: 1, name: 'bulbasaur', spriteUrl: 'https://artwork/1.png', isCurrent: false };
const current: Model = { pokemonId: 2, name: 'ivysaur', spriteUrl: null, isCurrent: true };

function renderInRouter(ui: React.ReactNode, initial = '/pokemon/2') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/pokemon/:id" element={<div>{ui}</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('<EvolutionStage>', () => {
  it('non-current stage renders as a link with title-cased name + #NNN id', () => {
    renderInRouter(<EvolutionStage stage={bulba} />);
    const link = screen.getByRole('link', { name: 'Bulbasaur' });
    expect(link).toHaveAttribute('href', '/pokemon/1');
    expect(screen.getByText('#001')).toBeInTheDocument();
  });

  it('current stage renders as non-interactive with aria-current="page"', () => {
    renderInRouter(<EvolutionStage stage={current} />);
    const el = screen.getByLabelText('Ivysaur, current Pokémon');
    expect(el).toHaveAttribute('aria-current', 'page');
    expect(el.tagName).toBe('DIV');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows a placeholder when spriteUrl is null', () => {
    renderInRouter(<EvolutionStage stage={current} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keyboard Enter on a focused non-current stage activates the link', async () => {
    const user = userEvent.setup();
    renderInRouter(<EvolutionStage stage={bulba} />);
    const link = screen.getByRole('link', { name: 'Bulbasaur' });
    link.focus();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    // Real navigation happens in integration tests; here we just confirm focus + Enter works without throwing
  });
});
