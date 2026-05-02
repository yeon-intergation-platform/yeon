"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "yeon:character-frame-sequences";

export type FrameSlot = { frameIdx: number; enabled: boolean };

type SequenceStore = Record<string, FrameSlot[]>;

function migrateEntry(value: unknown): FrameSlot[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  // 구형 number[] 포맷 → FrameSlot[] 마이그레이션
  if (typeof value[0] === "number") {
    return (value as number[]).map((fi) => ({ frameIdx: fi, enabled: true }));
  }
  return value as FrameSlot[];
}

function readStore(): SequenceStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      unknown
    >;
    const result: SequenceStore = {};
    for (const [id, val] of Object.entries(raw)) {
      const migrated = migrateEntry(val);
      if (migrated) result[id] = migrated;
    }
    return result;
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
    (characterId: string, seq: FrameSlot[] | null) => {
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
