import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BackButton } from './BackButton';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderInRouter(ui: React.ReactNode) {
  return render(<MemoryRouter><Routes><Route path="/" element={ui} /></Routes></MemoryRouter>);
}

function setHistoryIdx(idx: number | undefined) {
  Object.defineProperty(window.history, 'state', {
    configurable: true,
    value: idx === undefined ? null : { idx },
  });
}

describe('<BackButton>', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('has an accessible name derived from the label', () => {
    renderInRouter(<BackButton />);
    expect(screen.getByRole('button', { name: 'Back to catalog' })).toBeInTheDocument();
  });

  it('accepts a custom label', () => {
    renderInRouter(<BackButton label="Go home" />);
    expect(screen.getByRole('button', { name: 'Go home' })).toBeInTheDocument();
  });

  it('navigates(-1) when history has prior entries (idx > 0)', async () => {
    setHistoryIdx(2);
    const user = userEvent.setup();
    renderInRouter(<BackButton />);
    await user.click(screen.getByRole('button'));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates to fallbackTo when idx is 0 (deep link)', async () => {
    setHistoryIdx(0);
    const user = userEvent.setup();
    renderInRouter(<BackButton />);
    await user.click(screen.getByRole('button'));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('navigates to custom fallbackTo when provided', async () => {
    setHistoryIdx(undefined);
    const user = userEvent.setup();
    renderInRouter(<BackButton fallbackTo="/custom" />);
    await user.click(screen.getByRole('button'));
    expect(navigateMock).toHaveBeenCalledWith('/custom');
  });

  it('activates on keyboard (Enter)', async () => {
    setHistoryIdx(1);
    const user = userEvent.setup();
    renderInRouter(<BackButton />);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
