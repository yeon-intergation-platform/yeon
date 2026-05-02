"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "yeon:character-frame-sequences";

type SequenceStore = Record<string, number[]>;

function readStore(): SequenceStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}"
    ) as SequenceStore;
  } catch {
    return {};
  }
}

export function useFrameSequenceStore() {
  const [store, setStore] = useState<SequenceStore>({});

  useEffect(() => {
    setStore(readStore());
  }, []);

  const setSequence = useCallback(
    (characterId: string, seq: number[] | null) => {
      setStore((prev) => {
        const next = { ...prev };
        if (!seq || seq.length === 0) {
          delete next[characterId];
        } else {
          next[characterId] = seq;
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // localStorage 미지원 환경(프라이빗 브라우징 등) 무시
        }
        return next;
      });
    },
    []
  );

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage 미지원 환경 무시
    }
    setStore({});
  }, []);

  return { store, setSequence, resetAll };
}
