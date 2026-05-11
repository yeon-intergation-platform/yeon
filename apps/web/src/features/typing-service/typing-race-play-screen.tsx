"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TYPING_ROOM_LANGUAGE,
  type TypingRoomCreateMessage,
} from "@yeon/race-shared";
import { useTypingProfile } from "./use-typing-profile";
import { usePlayerIdentity } from "./use-player-identity";
import { useRaceRoom } from "./use-race-room";
import { TypingRaceMultiplayerScreen } from "./typing-race-multiplayer-screen";
import { TypingRaceSoloScreen } from "./typing-race-solo-screen";
import { TypingServiceHeader } from "./typing-service-header";
import {
  createTranslator,
  resolveTypingRaceSeed,
  useSelectedTypingDeck,
  useTypingSettings,
  type TypingRaceSeed,
} from "./use-typing-settings";

const CONNECTION_TIMEOUT_MS = 4000;

export function TypingRacePlayScreen() {
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const deckState = useSelectedTypingDeck(settings.locale);
  const t = createTranslator(settings.locale);
  const playerId = usePlayerIdentity();
  const [fallbackToSolo, setFallbackToSolo] = useState(false);
  const [seedState, setSeedState] = useState<
    | { kind: "idle" | "loading" }
    | { kind: "ready"; seed: TypingRaceSeed | null }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    setSeedState({ kind: "loading" });

    resolveTypingRaceSeed(deckState.selectedDeck, settings.locale).then(
      (result) => {
        if (cancelled) return;
        if (result.ok) {
          setSeedState({ kind: "ready", seed: result.seed });
          return;
        }
        setSeedState({ kind: "error", message: result.message });
        setFallbackToSolo(true);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [deckState.selectedDeck, settings.locale]);

  const quickRoom = useMemo<TypingRoomCreateMessage | null>(
    () =>
      seedState.kind === "ready"
        ? {
            selectedDeckId: deckState.selectedDeck.id,
            selectedDeckVisibility: deckState.selectedDeck.visibility,
            lobbyDeckTitle:
              deckState.selectedDeck.visibility === "private"
                ? "비공개 덱"
                : deckState.selectedDeck.title,
            participantDeckTitle: deckState.selectedDeck.title,
            language:
              deckState.selectedDeck.languageTag === "en"
                ? TYPING_ROOM_LANGUAGE.EN
                : TYPING_ROOM_LANGUAGE.KO,
            raceSeed: seedState.seed ?? undefined,
          }
        : null,
    [
      deckState.selectedDeck.id,
      deckState.selectedDeck.languageTag,
      deckState.selectedDeck.title,
      deckState.selectedDeck.visibility,
      seedState,
    ]
  );

  const race = useRaceRoom({
    enabled:
      profileLoaded &&
      !!playerId &&
      !fallbackToSolo &&
      seedState.kind === "ready",
    playerLabel: profile.nickname,
    playerId,
    characterId: profile.characterId,
    locale: settings.locale,
    quickRoom,
  });

  // 연결 실패 시 솔로 모드로 fallback
  useEffect(() => {
    if (race.connectionState === "connected" || race.connectionState === "idle")
      return;
    if (
      race.connectionState === "error" ||
      race.connectionState === "disconnected"
    ) {
      setFallbackToSolo(true);
      return;
    }
    if (race.connectionState === "connecting") {
      const timeout = window.setTimeout(() => {
        setFallbackToSolo(true);
      }, CONNECTION_TIMEOUT_MS);
      return () => window.clearTimeout(timeout);
    }
  }, [race.connectionState]);

  const retryMultiplayer = () => {
    setFallbackToSolo(false);
    race.rejoin();
  };

  if (fallbackToSolo) {
    return (
      <TypingRaceSoloScreen
        offlineReason={t("offlineFallback")}
        retryLabel={t("reconnect")}
        onRetryMultiplayer={retryMultiplayer}
      />
    );
  }

  if (race.connectionState !== "connected" || !race.prompt) {
    return (
      <div className="min-h-screen bg-white text-[#111]">
        <TypingServiceHeader active="race" title="YEON 레이스" />
        <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
          <div className="flex flex-col items-center gap-3 font-mono text-[13px] text-[#888]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
            <span>{t("connectingToServer")}</span>
          </div>
        </div>
      </div>
    );
  }

  return <TypingRaceMultiplayerScreen race={race} />;
}
