import { describe, it, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
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

describe('HomePage a11y', () => {
  it('loaded grid has no critical WCAG 2.1 AA violations', async () => {
    const { container } = renderHome();
    // Wait for the loaded state so we audit real cards/controls, not skeletons
    await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeInTheDocument(), {
      timeout: 5000,
    });
    const results = await axe(container, {
      rules: {
        // color-contrast requires real rendered CSS from the browser;
        // jsdom cannot compute it reliably, so we disable it here.
        // Verified manually in /preview.
        'color-contrast': { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
