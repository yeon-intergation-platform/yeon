"use client";
import { useCallback, useEffect, useState } from "react";
import {
  readYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { DEFAULT_CHARACTER_ID, findCharacter } from "./characters";

export type TypingProfile = {
  nickname: string;
  characterId: string;
};

const STORAGE_KEY = "yeon:typing-profile";
const DEFAULT_PROFILE: TypingProfile = {
  nickname: "Guest",
  characterId: DEFAULT_CHARACTER_ID,
};

function normalizeProfile(raw: unknown): TypingProfile {
  if (!raw || typeof raw !== "object") return DEFAULT_PROFILE;
  const candidate = raw as Partial<TypingProfile>;
  const nickname =
    typeof candidate.nickname === "string" &&
    candidate.nickname.trim().length > 0
      ? candidate.nickname.trim()
      : DEFAULT_PROFILE.nickname;
  // registry에서 사라진 캐릭터 ID는 기본값으로 폴백 — 오래된 저장소 값 방어.
  const characterId = findCharacter(
    typeof candidate.characterId === "string" ? candidate.characterId : null
  ).id;
  return { nickname, characterId };
}

export function useTypingProfile() {
  const [profile, setProfile] = useState<TypingProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = readYeonLocalStorageItem(STORAGE_KEY);
      if (raw) setProfile(normalizeProfile(JSON.parse(raw)));
    } catch {
      // 저장소 접근 불가 환경 무시
    }
    setLoaded(true);
  }, []);

  const updateProfile = useCallback((updates: Partial<TypingProfile>) => {
    setProfile((prev) => {
      const next = normalizeProfile({ ...prev, ...updates });
      try {
        writeYeonLocalStorageItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { profile, updateProfile, loaded };
}
