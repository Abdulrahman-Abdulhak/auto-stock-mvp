"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * Returns a debounced version of a callback that delays invocation until after
 * `delay` milliseconds have elapsed since the last call.
 *
 * The hook preserves the latest callback reference to avoid re-creating timers
 * when the function identity changes, and returns `undefined` when no callback
 * is provided.
 *
 * @template T - Function type of the callback
 * @param cb - Callback to debounce (may be `undefined`)
 * @param delay - Delay in milliseconds
 * @returns A debounced function matching the parameters of `cb`, or `undefined` if `cb` is falsy.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  cb: T | undefined,
  delay: number
) {
  const cbRef = useRef(cb);

  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  return useMemo(() => {
    if (!cb) return undefined;
    let t: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => cbRef.current?.(...args), delay);
    };
  }, [cb, delay]);
}
