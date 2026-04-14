import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EvolutionChain } from './EvolutionChain';
import { server } from '../../../test/server';
import { POKEAPI_BASE } from '../../../config/catalog';

function renderChain(chainId: number, currentId: number) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/pokemon/' + currentId]}>
        <Routes>
          <Route
            path="/pokemon/:id"
            element={<EvolutionChain chainId={chainId} currentPokemonId={currentId} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('<EvolutionChain>', () => {
  it('always renders the "Evolution" heading (even in loading state)', () => {
    renderChain(1, 1);
    expect(screen.getByRole('heading', { level: 2, name: 'Evolution' })).toBeInTheDocument();
  });

  it('shows skeleton then the loaded linear chain (Bulbasaur)', async () => {
    renderChain(1, 1);
    expect(screen.getByTestId('skeleton-evolution')).toBeInTheDocument();
    await waitFor(
      () => expect(screen.getByLabelText('Bulbasaur, current Pokémon')).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.getByRole('link', { name: 'Ivysaur' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Venusaur' })).toBeInTheDocument();
    expect(screen.getByText('Lv. 16')).toBeInTheDocument();
    expect(screen.getByText('Lv. 32')).toBeInTheDocument();
  });

  it('renders branching layout for Eevee (chain 67) with the current stage highlighted', async () => {
    renderChain(67, 134);
    await waitFor(
      () => expect(screen.getByLabelText('Vaporeon, current Pokémon')).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.getByRole('link', { name: 'Eevee' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jolteon' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Flareon' })).toBeInTheDocument();
  });

  it('renders the "does not evolve" copy for Tauros (chain 59)', async () => {
    renderChain(59, 128);
    await waitFor(
      () => expect(screen.getByText('This Pokémon does not evolve.')).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders ErrorState with a working Retry on chain 500', async () => {
    let callCount = 0;
    server.use(
      http.get(`${POKEAPI_BASE}/evolution-chain/1`, () => {
        callCount++;
        if (callCount === 1) return HttpResponse.json({ error: 'boom' }, { status: 500 });
        // fall through on retry: let MSW pass through to default handler? Simpler: respond with OK fixture
        return HttpResponse.json({
          id: 1,
          chain: {
            species: { name: 'bulbasaur', url: `${POKEAPI_BASE}/pokemon-species/1/` },
            evolution_details: [],
            evolves_to: [],
          },
        });
      }),
    );
    renderChain(1, 1);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(
      () => expect(screen.getByText('This Pokémon does not evolve.')).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });
});
