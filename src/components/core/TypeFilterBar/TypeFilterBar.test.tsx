import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypeFilterBar } from './TypeFilterBar';
import { TYPE_LIST } from '../../../config/catalog';

describe('<TypeFilterBar>', () => {
  it('renders one chip per type (18)', () => {
    render(<TypeFilterBar active={new Set()} onChange={() => {}} />);
    // 18 chips; reset hidden; count chip buttons only
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'));
    expect(chips).toHaveLength(TYPE_LIST.length);
    expect(chips).toHaveLength(18);
  });

  it('does not render reset when no chip is active', () => {
    render(<TypeFilterBar active={new Set()} onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Reset filters' })).not.toBeInTheDocument();
  });

  it('renders reset when any chip is active', () => {
    render(<TypeFilterBar active={new Set(['fire'])} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeInTheDocument();
  });

  it('clicking an inactive chip adds that type to the set', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TypeFilterBar active={new Set()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Fire' }));
    expect(onChange).toHaveBeenCalledWith(new Set(['fire']));
  });

  it('clicking an active chip removes it from the set', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TypeFilterBar active={new Set(['fire', 'flying'])} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Fire' }));
    expect(onChange).toHaveBeenCalledWith(new Set(['flying']));
  });

  it('reset fires onChange(new Set())', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TypeFilterBar active={new Set(['fire'])} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(onChange).toHaveBeenCalledWith(new Set());
  });
});
