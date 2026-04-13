import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './HomePage';

function renderHome(initialPath = '/') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('<HomePage>', () => {
  it('renders skeletons then page 1 cards', async () => {
    renderHome();
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.getByText('#001')).toBeInTheDocument();
  });

  it('page 1 shows 24 cards', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getAllByRole('link').length).toBe(24);
    }, { timeout: 5000 });
  });

  it('navigating to next page shows cards 25-48', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Next page'));
    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });
  });

  it('direct URL to page 7 (last) shows 7 cards and disables next', async () => {
    renderHome('/?page=7');
    await waitFor(() => {
      expect(screen.getAllByRole('link').length).toBe(7);
    }, { timeout: 5000 });
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByText('Mew')).toBeInTheDocument();
  });

  it('typing "char" filters the grid to matching Pokémon', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const user = userEvent.setup();
    const input = screen.getByLabelText('Search Pokémon');
    await user.type(input, 'char');
    await waitFor(() => {
      expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Charmander')).toBeInTheDocument();
    expect(screen.getByText('Charmeleon')).toBeInTheDocument();
    expect(screen.getByText('Charizard')).toBeInTheDocument();
    expect(screen.queryByText('Pikachu')).not.toBeInTheDocument();
  });

  it('searching by numeric ID finds that Pokémon', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Search Pokémon'), '150');
    await waitFor(() => {
      expect(screen.getByText('Mewtwo')).toBeInTheDocument();
    });
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
  });

  it('zero-match search shows empty state with Clear search CTA', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Search Pokémon'), 'zzzzzz');
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/No Pokémon match/);
    });
    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearBtn);
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('clicking clear button on search input restores the full grid', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Search Pokémon'), 'char');
    await waitFor(() => {
      expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Clear input'));
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getAllByRole('link').length).toBe(24);
    });
  });
});
