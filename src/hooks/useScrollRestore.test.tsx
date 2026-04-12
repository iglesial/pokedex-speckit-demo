import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useScrollRestore } from './useScrollRestore';

function wrapper(initialPath: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  );
}

describe('useScrollRestore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  it('captures scrollY and focused card id on unmount, keyed by URL', () => {
    const { result, unmount } = renderHook(() => useScrollRestore(), {
      wrapper: wrapper('/?page=2'),
    });

    act(() => result.current.rememberFocus(42));
    Object.defineProperty(window, 'scrollY', { value: 350, configurable: true });

    unmount();

    const anchors = JSON.parse(sessionStorage.getItem('pokedex.scrollAnchors')!);
    expect(anchors['/?page=2']).toEqual({ scrollY: 350, focusCardId: 42 });
  });

  it('restores scroll position for the matching URL', () => {
    sessionStorage.setItem(
      'pokedex.scrollAnchors',
      JSON.stringify({ '/?page=3': { scrollY: 800, focusCardId: null } }),
    );
    renderHook(() => useScrollRestore(), { wrapper: wrapper('/?page=3') });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 800 });
  });

  it('does nothing when no anchor exists for the current URL', () => {
    renderHook(() => useScrollRestore(), { wrapper: wrapper('/?page=5') });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
