import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DetailPage } from './DetailPage';
import { server } from '../../test/server';
import { POKEAPI_BASE } from '../../config/catalog';

function renderDetail(path: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/pokemon/:id" element={<DetailPage />} />
          <Route path="/" element={<div>Catalog home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('<DetailPage>', () => {
  it('renders skeleton then loaded hero + stats + abilities + flavor', async () => {
    renderDetail('/pokemon/6');
    expect(screen.getByTestId('skeleton-detail')).toBeInTheDocument();
    await waitFor(
      () => expect(screen.getByRole('heading', { level: 1, name: 'Charizard' })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.getByText('#006')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Flying')).toBeInTheDocument();
    expect(screen.getByLabelText('HP 78 out of 255')).toBeInTheDocument();
    expect(screen.getByLabelText('Sp. Atk 109 out of 255')).toBeInTheDocument();
    expect(screen.getByText('Blaze')).toBeInTheDocument();
    expect(screen.getByText('Solar Power')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
    expect(
      screen.getByText('Spits fire that is hot enough to melt boulders.'),
    ).toBeInTheDocument();
  });

  it('resolves /pokemon/006 the same as /pokemon/6', async () => {
    renderDetail('/pokemon/006');
    await waitFor(
      () => expect(screen.getByRole('heading', { level: 1, name: 'Charizard' })).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });

  it('omits the flavor section when no English entry exists', async () => {
    renderDetail('/pokemon/150');
    await waitFor(
      () => expect(screen.getByRole('heading', { level: 1, name: 'Mewtwo' })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.queryByText('Pokédex entry')).not.toBeInTheDocument();
  });

  it('renders NotFoundState for non-numeric id without firing a request', async () => {
    const spy = vi.fn();
    server.use(
      http.get(`${POKEAPI_BASE}/pokemon/:id`, () => {
        spy();
        return HttpResponse.json({}, { status: 200 });
      }),
    );
    renderDetail('/pokemon/abc');
    expect(screen.getByRole('status')).toHaveTextContent(/No Pokémon with ID abc/);
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders NotFoundState for out-of-range id (999)', () => {
    renderDetail('/pokemon/999');
    expect(screen.getByRole('status')).toHaveTextContent(/No Pokémon with ID 999/);
  });

  it('renders NotFoundState on upstream 404', async () => {
    server.use(
      http.get(`${POKEAPI_BASE}/pokemon/50`, () =>
        HttpResponse.json({ error: 'not found' }, { status: 404 }),
      ),
    );
    renderDetail('/pokemon/50');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/No Pokémon/), {
      timeout: 5000,
    });
  });

  it('renders ErrorState with Retry on upstream 500; retry recovers', async () => {
    let calls = 0;
    server.use(
      http.get(`${POKEAPI_BASE}/pokemon/25`, () => {
        calls++;
        if (calls === 1) return HttpResponse.json({ error: 'boom' }, { status: 500 });
        return HttpResponse.json({
          id: 25, name: 'pikachu', height: 4, weight: 60,
          types: [{ slot: 1, type: { name: 'electric' } }],
          sprites: { front_default: null, other: { 'official-artwork': { front_default: 'https://artwork/25.png' } } },
          stats: [
            { base_stat: 35, stat: { name: 'hp' } },
            { base_stat: 55, stat: { name: 'attack' } },
            { base_stat: 40, stat: { name: 'defense' } },
            { base_stat: 50, stat: { name: 'special-attack' } },
            { base_stat: 50, stat: { name: 'special-defense' } },
            { base_stat: 90, stat: { name: 'speed' } },
          ],
          abilities: [
            { ability: { name: 'static' }, is_hidden: false, slot: 1 },
          ],
        });
      }),
    );
    renderDetail('/pokemon/25');
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(
      () => expect(screen.getByRole('heading', { level: 1, name: 'Pikachu' })).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });

  it('BackButton is present on every state', () => {
    renderDetail('/pokemon/abc');
    expect(screen.getByRole('button', { name: 'Back to catalog' })).toBeInTheDocument();
  });
});

describe('<DetailPage> Evolution section', () => {
  it('renders the Evolution section below stats on a linear chain (Bulbasaur)', async () => {
    renderDetail('/pokemon/1');
    await waitFor(
      () => expect(screen.getByRole('heading', { level: 1, name: 'Bulbasaur' })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    // Evolution heading + chain members
    expect(screen.getByRole('heading', { level: 2, name: 'Evolution' })).toBeInTheDocument();
    await waitFor(
      () => expect(screen.getByLabelText('Bulbasaur, current Pokémon')).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.getByRole('link', { name: 'Ivysaur' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Venusaur' })).toBeInTheDocument();
  });

  it('renders "This Pokémon does not evolve." for Tauros', async () => {
    renderDetail('/pokemon/128');
    await waitFor(
      () => expect(screen.getByText('This Pokémon does not evolve.')).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });

  it('branching chain: Vaporeon highlighted; Eevee/Jolteon/Flareon are links', async () => {
    renderDetail('/pokemon/134');
    await waitFor(
      () => expect(screen.getByLabelText('Vaporeon, current Pokémon')).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.getByRole('link', { name: 'Eevee' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jolteon' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Flareon' })).toBeInTheDocument();
  });

  it('scoped chain error: rest of page stays functional', async () => {
    server.use(
      http.get(`${POKEAPI_BASE}/evolution-chain/1`, () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    renderDetail('/pokemon/1');
    await waitFor(
      () => expect(screen.getByRole('heading', { level: 1, name: 'Bulbasaur' })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    // Hero + stats + abilities all present
    expect(screen.getByLabelText(/HP/)).toBeInTheDocument();
    // Scoped Evolution error
    await waitFor(() =>
      expect(screen.getByText("Couldn't load the evolution chain.")).toBeInTheDocument(),
    );
    // BackButton still clickable (SC-006)
    expect(screen.getByRole('button', { name: 'Back to catalog' })).toBeEnabled();
  });
});
