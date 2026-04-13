import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypeFilterChip } from './TypeFilterChip';

describe('<TypeFilterChip>', () => {
  it('renders as a button with aria-pressed', () => {
    render(<TypeFilterChip type="fire" active={false} onToggle={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Fire' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects active state via aria-pressed', () => {
    render(<TypeFilterChip type="fire" active onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: 'Fire' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('fires onToggle with the chip type when clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<TypeFilterChip type="water" active={false} onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { name: 'Water' }));
    expect(onToggle).toHaveBeenCalledWith('water');
  });

  it('does not fire onToggle when disabled', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<TypeFilterChip type="water" active={false} disabled onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { name: 'Water' }));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
