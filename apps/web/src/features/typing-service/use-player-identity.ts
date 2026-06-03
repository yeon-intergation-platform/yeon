"use client";
import { useEffect, useState } from "react";
import {
  createYeonRandomUUID,
  getYeonNow,
  getYeonRandom,
  readYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const STORAGE_KEY = "yeon:typing-player-id";

function generateId() {
  return (
    createYeonRandomUUID() ??
    `p_${getYeonNow().toString(36)}_${getYeonRandom().toString(36).slice(2, 10)}`
  );
}

export function usePlayerIdentity() {
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    try {
      let id = readYeonLocalStorageItem(STORAGE_KEY);
      if (!id) {
        id = generateId();
        writeYeonLocalStorageItem(STORAGE_KEY, id);
      }
      setPlayerId(id);
    } catch {
      setPlayerId(generateId());
    }
  }, []);

  return playerId;
}
