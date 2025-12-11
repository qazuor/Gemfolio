import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDebounce, useDebouncedCallback } from '../src/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('c');
  });

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 0 },
    });

    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(42);
  });

  it('should work with objects', () => {
    const obj1 = { name: 'test' };
    const obj2 = { name: 'updated' };

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: obj1 },
    });

    rerender({ value: obj2 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toEqual(obj2);
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('arg1');
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');
  });

  it('should only execute last call when rapidly invoked', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('first');
    result.current('second');
    result.current('third');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('should pass multiple arguments', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    result.current('arg1', 'arg2', 123);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should cleanup timeout on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('test');
    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should reset timer on new calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('first');
    act(() => {
      vi.advanceTimersByTime(300);
    });

    result.current('second');
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('should handle unmount without pending callback', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useDebouncedCallback(callback, 500));

    // Unmount without ever calling the debounced callback
    unmount();

    // Should not throw and callback should never be called
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
