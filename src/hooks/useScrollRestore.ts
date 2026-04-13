import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface Anchor {
  scrollY: number;
  focusCardId: number | null;
}

const STORAGE_KEY = 'pokedex.scrollAnchors';

function loadAnchors(): Record<string, Anchor> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Anchor>;
  } catch {
    return {};
  }
}

function saveAnchors(anchors: Record<string, Anchor>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(anchors));
  } catch {
    /* ignore */
  }
}

export function useScrollRestore(): { rememberFocus: (id: number) => void } {
  const location = useLocation();
  const key = location.pathname + location.search;
  const focusIdRef = useRef<number | null>(null);

  // Restore on mount (and on location change)
  useEffect(() => {
    const anchors = loadAnchors();
    const anchor = anchors[key];
    if (anchor) {
      // Next frame so DOM has rendered
      requestAnimationFrame(() => {
        window.scrollTo({ top: anchor.scrollY });
        if (anchor.focusCardId != null) {
          const el = document.querySelector<HTMLElement>(
            `[data-card-id="${anchor.focusCardId}"]`,
          );
          el?.focus();
        }
      });
    }
  }, [key]);

  // Persist on unmount / navigation
  useEffect(() => {
    return () => {
      const anchors = loadAnchors();
      anchors[key] = { scrollY: window.scrollY, focusCardId: focusIdRef.current };
      saveAnchors(anchors);
    };
  }, [key]);

  const rememberFocus = (id: number) => {
    focusIdRef.current = id;
  };

  return { rememberFocus };
}
