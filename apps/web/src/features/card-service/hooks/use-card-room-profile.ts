"use client";
import { useEffect, useMemo, useState } from "react";
import { cardRoomProfileSchema } from "@yeon/api-contract/card-rooms";
import { findCharacter } from "@/features/typing-service/characters";
import {
  createYeonRandomUUID,
  getYeonNow,
  getYeonRandom,
  readYeonLocalStorageItem,
  removeYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const PROFILE_KEY = "yeon-card-room-profile";
const GUEST_ID_KEY = "yeon-card-room-guest-id";
const TYPING_PROFILE_KEY = "yeon:typing-profile";

export type CardRoomLocalProfile = {
  nickname: string;
  characterId: string;
};

function randomId() {
  return (
    createYeonRandomUUID() ??
    `${getYeonNow().toString(36)}-${getYeonRandom().toString(36).slice(2)}`
  );
}

function normalizeProfile(
  source: Partial<CardRoomLocalProfile> | null | undefined
): CardRoomLocalProfile {
  return {
    nickname: source?.nickname?.trim().slice(0, 40) || "Guest",
    characterId: findCharacter(source?.characterId ?? null).id,
  };
}

function warnCardRoomProfileParseFailure(key: string, error: unknown) {
  console.warn(
    `[CardRoomProfile] 저장된 프로필을 읽지 못해 기본 프로필로 대체합니다. key=${key}`,
    error
  );
}

export function readJsonProfile(
  key: string
): Partial<CardRoomLocalProfile> | null {
  const raw = readYeonLocalStorageItem(key);
  if (!raw) return null;

  try {
    const parsed = cardRoomProfileSchema.partial().safeParse(JSON.parse(raw));
    if (parsed.success && (parsed.data.nickname || parsed.data.characterId)) {
      return parsed.data;
    }
    warnCardRoomProfileParseFailure(key, parsed);
    removeYeonLocalStorageItem(key);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
    warnCardRoomProfileParseFailure(key, error);
    removeYeonLocalStorageItem(key);
  }

  return null;
}

function readProfile(): CardRoomLocalProfile {
  const cardRoomProfile = readJsonProfile(PROFILE_KEY);
  const typingProfile = readJsonProfile(TYPING_PROFILE_KEY);

  return normalizeProfile({
    nickname: cardRoomProfile?.nickname ?? typingProfile?.nickname,
    characterId: typingProfile?.characterId ?? cardRoomProfile?.characterId,
  });
}

function readGuestId() {
  const existing = readYeonLocalStorageItem(GUEST_ID_KEY);
  if (existing) return existing;
  const next = `guest_${randomId().replaceAll("-", "")}`;
  writeYeonLocalStorageItem(GUEST_ID_KEY, next);
  return next;
}

export function useCardRoomProfile() {
  const [profile, setProfileState] = useState<CardRoomLocalProfile>(() =>
    normalizeProfile(null)
  );
  const [guestId, setGuestId] = useState("guest-browser");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfileState(readProfile());
    setGuestId(readGuestId());
    setLoaded(true);
  }, []);

  const setProfile = (next: CardRoomLocalProfile) => {
    const normalized = normalizeProfile(next);
    setProfileState(normalized);
    writeYeonLocalStorageItem(PROFILE_KEY, JSON.stringify(normalized));
  };

  return useMemo(
    () => ({ profile, guestId, loaded, setProfile }),
    [profile, guestId, loaded]
  );
}
