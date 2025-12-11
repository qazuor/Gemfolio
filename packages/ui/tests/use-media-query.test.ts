import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useMediaQuery,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from '../src/hooks/use-media-query';

describe('useMediaQuery', () => {
  let listeners: Array<(event: MediaQueryListEvent) => void> = [];

  const createMatchMedia = (matches: boolean) => {
    return vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (type === 'change') {
          listeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (type === 'change') {
          listeners = listeners.filter((l) => l !== listener);
        }
      }),
      dispatchEvent: vi.fn(),
    }));
  };

  beforeEach(() => {
    listeners = [];
    window.matchMedia = createMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial match state', () => {
    window.matchMedia = createMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when query does not match', () => {
    window.matchMedia = createMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should update when media query changes', () => {
    window.matchMedia = createMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      for (const listener of listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup event listener on unmount', () => {
    const mockRemoveEventListener = vi.fn();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: mockRemoveEventListener,
    }));

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle query changes', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('768'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: '(min-width: 768px)' },
    });

    expect(result.current).toBe(true);

    rerender({ query: '(max-width: 500px)' });
    expect(result.current).toBe(false);
  });
});

describe('useIsMobile', () => {
  it('should return true for mobile viewport', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for non-mobile viewport', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  it('should return true for tablet viewport', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px) and (max-width: 1023px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });
});

describe('useIsDesktop', () => {
  it('should return true for desktop viewport', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 1024px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});

describe('usePrefersDarkMode', () => {
  it('should return true when dark mode is preferred', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(true);
  });

  it('should return false when light mode is preferred', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(false);
  });
});

describe('usePrefersReducedMotion', () => {
  it('should return true when reduced motion is preferred', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('should return false when reduced motion is not preferred', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
