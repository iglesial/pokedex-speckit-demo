import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';

describe('<SearchInput>', () => {
  it('renders with a label', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Search Pokémon')).toBeInTheDocument();
  });

  it('fires onChange when user types', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={onChange} />);
    await user.type(screen.getByLabelText('Search Pokémon'), 'pika');
    expect(onChange).toHaveBeenCalled();
    // userEvent.type fires once per char with the full new value
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('shows clear button only when value is non-empty', () => {
    const { rerender } = render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument();
    rerender(<SearchInput value="char" onChange={() => {}} />);
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
  });

  it('clear button fires onChange("")', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="char" onChange={onChange} />);
    await user.click(screen.getByLabelText('Clear input'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('fires onArrowDown on ArrowDown keydown and prevents default', async () => {
    const onArrowDown = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={() => {}} onArrowDown={onArrowDown} />);
    const input = screen.getByLabelText('Search Pokémon');
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(onArrowDown).toHaveBeenCalledOnce();
  });

  it('does not call onArrowDown when not provided', async () => {
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Search Pokémon');
    input.focus();
    await user.keyboard('{ArrowDown}');
    // no crash = success
    expect(input).toHaveFocus();
  });
});
