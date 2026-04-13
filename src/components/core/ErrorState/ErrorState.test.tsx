import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from './ErrorState';

describe('<ErrorState>', () => {
  it('renders default message', () => {
    render(<ErrorState />);
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load");
  });

  it('renders custom message', () => {
    render(<ErrorState message="Nope" />);
    expect(screen.getByText('Nope')).toBeInTheDocument();
  });

  it('invokes onRetry', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('omits retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
