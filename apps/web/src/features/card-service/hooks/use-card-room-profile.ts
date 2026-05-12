"use client";

import { useEffect, useMemo, useState } from "react";
import { findCharacter } from "@/features/typing-service/characters";

const PROFILE_KEY = "yeon-card-room-profile";
const GUEST_ID_KEY = "yeon-card-room-guest-id";
const TYPING_PROFILE_KEY = "yeon:typing-profile";

export type CardRoomLocalProfile = {
  nickname: string;
  characterId: string;
};

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeProfile(
  source: Partial<CardRoomLocalProfile> | null | undefined
): CardRoomLocalProfile {
  return {
    nickname: source?.nickname?.trim().slice(0, 40) || "Guest",
    characterId: findCharacter(source?.characterId ?? null).id,
  };
}

function readJsonProfile(key: string): Partial<CardRoomLocalProfile> | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CardRoomLocalProfile>;
    if (parsed.nickname || parsed.characterId) return parsed;
  } catch {
    localStorage.removeItem(key);
  }

  return null;
}

function readProfile(): CardRoomLocalProfile {
  if (typeof localStorage === "undefined") {
    return normalizeProfile(null);
  }

  const cardRoomProfile = readJsonProfile(PROFILE_KEY);
  const typingProfile = readJsonProfile(TYPING_PROFILE_KEY);

  return normalizeProfile({
    nickname: cardRoomProfile?.nickname ?? typingProfile?.nickname,
    characterId: typingProfile?.characterId ?? cardRoomProfile?.characterId,
  });
}

function readGuestId() {
  if (typeof localStorage === "undefined") return "guest-browser";
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const next = `guest_${randomId().replaceAll("-", "")}`;
  localStorage.setItem(GUEST_ID_KEY, next);
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
    localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
  };

  return useMemo(
    () => ({ profile, guestId, loaded, setProfile }),
    [profile, guestId, loaded]
  );
}
