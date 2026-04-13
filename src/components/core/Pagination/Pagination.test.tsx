import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('<Pagination>', () => {
  it('renders nothing when totalPages === 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('disables prev on first page', () => {
    render(<Pagination page={1} totalPages={7} onChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
  });

  it('disables next on last page', () => {
    render(<Pagination page={7} totalPages={7} onChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('fires onChange with target page', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={3} totalPages={7} onChange={onChange} />);
    await user.click(screen.getByLabelText('Next page'));
    expect(onChange).toHaveBeenCalledWith(4);
    await user.click(screen.getByLabelText('Previous page'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('elides with ellipsis when totalPages > 7', () => {
    render(<Pagination page={5} totalPages={20} onChange={() => {}} />);
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
    // First and last pages always shown
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
  });

  it('marks current page with aria-current', () => {
    render(<Pagination page={3} totalPages={7} onChange={() => {}} />);
    const current = screen.getByRole('button', { name: '3' });
    expect(current).toHaveAttribute('aria-current', 'page');
  });
});
