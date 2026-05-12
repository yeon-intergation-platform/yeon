"use client";

import { useEffect, useMemo, useState } from "react";

const PROFILE_KEY = "yeon-card-room-profile";
const GUEST_ID_KEY = "yeon-card-room-guest-id";

export type CardRoomLocalProfile = {
  nickname: string;
  characterId: string;
};

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function readProfile(): CardRoomLocalProfile {
  if (typeof localStorage === "undefined") return { nickname: "Guest", characterId: "guga" };
  const raw = localStorage.getItem(PROFILE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<CardRoomLocalProfile>;
      if (parsed.nickname && parsed.characterId) return { nickname: parsed.nickname, characterId: parsed.characterId };
    } catch {
      localStorage.removeItem(PROFILE_KEY);
    }
  }
  return { nickname: "Guest", characterId: "guga" };
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
  const [profile, setProfileState] = useState<CardRoomLocalProfile>(() => ({ nickname: "Guest", characterId: "guga" }));
  const [guestId, setGuestId] = useState("guest-browser");

  useEffect(() => {
    setProfileState(readProfile());
    setGuestId(readGuestId());
  }, []);

  const setProfile = (next: CardRoomLocalProfile) => {
    const normalized = { nickname: next.nickname.trim().slice(0, 40) || "Guest", characterId: next.characterId || "guga" };
    setProfileState(normalized);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
  };

  return useMemo(() => ({ profile, guestId, setProfile }), [profile, guestId]);
}
