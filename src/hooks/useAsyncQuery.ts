import { useCallback, useEffect, useState } from "react";

interface AsyncQueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Runs an async query whenever `deps` change, guarding against stale/out-of-order results. */
export function useAsyncQuery<T>(fn: () => Promise<T>, deps: unknown[]): AsyncQueryState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncQueryState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [...deps, tick]);

  return { ...state, reload };
}
