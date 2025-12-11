import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocalStorage } from '../src/hooks/use-local-storage';

describe('useLocalStorage', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should return stored value from localStorage', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
  });

  it('should support functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });

  it('should remove value from localStorage', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe('default');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should work with objects', () => {
    const defaultObj = { name: 'default', count: 0 };
    const { result } = renderHook(() => useLocalStorage('obj-key', defaultObj));

    expect(result.current[0]).toEqual(defaultObj);

    act(() => {
      result.current[1]({ name: 'updated', count: 42 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 42 });
  });

  it('should work with arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr-key', []));

    expect(result.current[0]).toEqual([]);

    act(() => {
      result.current[1](['item1', 'item2']);
    });

    expect(result.current[0]).toEqual(['item1', 'item2']);
  });

  it('should work with booleans', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('should handle JSON parse errors gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid json');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle storage events from other tabs', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('from-other-tab'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('from-other-tab');
  });

  it('should ignore storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('other-value'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should ignore storage events with null newValue', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: null,
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should handle storage event with invalid JSON gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: 'invalid json {',
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle localStorage setItem errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle localStorage removeItem errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'stored'));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useLocalStorage('test-key', 'initial'));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
