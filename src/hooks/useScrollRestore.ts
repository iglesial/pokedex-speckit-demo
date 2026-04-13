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

  // Restore only once per component mount. URL changes from in-page actions
  // (typing, clearing search, toggling filters, paginating) must NOT re-run
  // restoration — otherwise deleting a search term would hijack focus back
  // to the last-clicked card. Real back-navigation from /pokemon/:id unmounts
  // HomePage and remounts it, which resets this ref and re-runs restoration.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const anchors = loadAnchors();
    const anchor = anchors[key];
    if (!anchor) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: anchor.scrollY });
      if (anchor.focusCardId != null) {
        const el = document.querySelector<HTMLElement>(
          `[data-card-id="${anchor.focusCardId}"]`,
        );
        el?.focus();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
