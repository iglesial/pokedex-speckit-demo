import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DetailPage } from './DetailPage';

function renderDetail(path: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/pokemon/:id" element={<DetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DetailPage a11y', () => {
  it('loaded state has no critical WCAG 2.1 AA violations', async () => {
    const { container } = renderDetail('/pokemon/6');
    await waitFor(
      () => expect(screen.getByRole('heading', { level: 1, name: 'Charizard' })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
