import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './EmptyState';

describe('<EmptyState>', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByRole('status')).toHaveTextContent('Nothing here');
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Nope" description="Try different search" />);
    expect(screen.getByText('Try different search')).toBeInTheDocument();
  });

  it('omits action button when onAction missing', () => {
    render(<EmptyState title="Nope" actionLabel="Reset" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('invokes onAction when clicked', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<EmptyState title="Nope" actionLabel="Reset" onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});
