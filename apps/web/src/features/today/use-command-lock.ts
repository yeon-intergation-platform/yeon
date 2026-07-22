"use client";

import { useCallback, useRef, useState } from "react";

export function useSubmitLock() {
  const submittingRef = useRef(false);

  return useCallback(
    async <Result>(
      command: () => Promise<Result>
    ): Promise<Result | undefined> => {
      if (submittingRef.current) return undefined;

      submittingRef.current = true;
      try {
        return await command();
      } finally {
        submittingRef.current = false;
      }
    },
    []
  );
}

export function useCommandLock<Key extends string | number>() {
  const activeKeysRef = useRef(new Set<Key>());
  const [activeKeys, setActiveKeys] = useState<Set<Key>>(() => new Set());

  const updateActiveKeys = useCallback(() => {
    setActiveKeys(new Set(activeKeysRef.current));
  }, []);

  const run = useCallback(
    async <Result>(
      key: Key,
      command: () => Promise<Result>
    ): Promise<Result | undefined> => {
      if (activeKeysRef.current.has(key)) return undefined;

      activeKeysRef.current.add(key);
      updateActiveKeys();
      try {
        return await command();
      } finally {
        activeKeysRef.current.delete(key);
        updateActiveKeys();
      }
    },
    [updateActiveKeys]
  );

  return {
    isLocked: useCallback((key: Key) => activeKeys.has(key), [activeKeys]),
    run,
  };
}
