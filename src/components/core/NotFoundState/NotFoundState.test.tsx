import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundState } from './NotFoundState';

function renderInRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('<NotFoundState>', () => {
  it('renders a generic heading when no id is provided', () => {
    renderInRouter(<NotFoundState />);
    expect(screen.getByRole('status')).toHaveTextContent('No Pokémon found');
  });

  it('renders an ID-specific heading when id is provided', () => {
    renderInRouter(<NotFoundState id="999" />);
    expect(screen.getByText('No Pokémon with ID 999')).toBeInTheDocument();
  });

  it('renders a link back to the catalog', () => {
    renderInRouter(<NotFoundState />);
    const link = screen.getByRole('link', { name: 'Back to catalog' });
    expect(link).toHaveAttribute('href', '/');
  });
});
