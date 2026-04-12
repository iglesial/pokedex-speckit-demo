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
    // skeletons visible first
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
    // then cards appear
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    }, { timeout: 5000 });
    // ID formatting
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
      expect(screen.getByText('Pikachu')).toBeInTheDocument(); // id 25 → page 2
    });
  });

  it('direct URL to page 7 (last) shows 7 cards and disables next', async () => {
    renderHome('/?page=7');
    await waitFor(() => {
      expect(screen.getAllByRole('link').length).toBe(7);
    }, { timeout: 5000 });
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    // last Pokémon present
    expect(screen.getByText('Mew')).toBeInTheDocument(); // id 151
  });
});
