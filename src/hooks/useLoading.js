// src/hooks/useLoading.js
import { useCallback, useMemo, useState } from "react";

export default function useLoading() {
  const [map, setMap] = useState({}); // { key: true }

  const start = useCallback((key) => {
    setMap((m) => ({ ...m, [key]: true }));
  }, []);

  const stop = useCallback((key) => {
    setMap((m) => {
      const n = { ...m };
      delete n[key];
      return n;
    });
  }, []);

  const is = useCallback((key) => !!map[key], [map]);

  const any = useCallback((keys) => {
    if (!keys) return Object.keys(map).length > 0;
    return keys.some((k) => !!map[k]);
  }, [map]);

  const wrap = useCallback(async (key, fn) => {
    try {
      start(key);
      return await fn();
    } finally {
      stop(key);
    }
  }, [start, stop]);

  return useMemo(() => ({ start, stop, is, any, wrap }), [start, stop, is, any, wrap]);
}
