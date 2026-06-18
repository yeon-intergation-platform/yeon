"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getTypingUiText } from "./typing-service-i18n";
import { YeonText, YeonView } from "@yeon/ui";
import {
  clearYeonTimeout,
  scheduleYeonTimeout,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

const CONNECTION_TIMEOUT_MS = 4000;

export function TypingRacePlayScreen() {
  const { profile, loaded: profileLoaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const deckState = useSelectedTypingDeck(settings.locale);
  const t = createTranslator(settings.locale);
  const text = getTypingUiText(settings.locale);
  const playerId = usePlayerIdentity();
  const [fallbackToSolo, setFallbackToSolo] = useState(false);
  const [seedRefreshToken, setSeedRefreshToken] = useState(0);
  const lastSeedPassageIdRef = useRef<string | null>(null);
  const [seedState, setSeedState] = useState<
    | { kind: "idle" | "loading" }
    | { kind: "ready"; seed: TypingRaceSeed | null }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    setSeedState({ kind: "loading" });

    async function loadSeed() {
      const result = await resolveTypingRaceSeed(
        deckState.selectedDeck,
        settings.locale,
        { excludedPassageId: lastSeedPassageIdRef.current }
      );
      const shouldRetrySameRemoteSeed =
        result.ok &&
        result.seed?.seedToken &&
        result.seed.passageId === lastSeedPassageIdRef.current;
      const finalResult = shouldRetrySameRemoteSeed
        ? await resolveTypingRaceSeed(deckState.selectedDeck, settings.locale, {
            excludedPassageId: lastSeedPassageIdRef.current,
          })
        : result;

      if (cancelled) return;
      if (finalResult.ok) {
        lastSeedPassageIdRef.current = finalResult.seed?.passageId ?? null;
        setSeedState({ kind: "ready", seed: finalResult.seed });
        return;
      }
      setSeedState({ kind: "error", message: finalResult.message });
      setFallbackToSolo(true);
    }

    loadSeed();

    return () => {
      cancelled = true;
    };
  }, [deckState.selectedDeck, seedRefreshToken, settings.locale]);

  const quickRoom = useMemo<TypingRoomCreateMessage | null>(
    () =>
      seedState.kind === "ready"
        ? {
            selectedDeckId: deckState.selectedDeck.id,
            selectedDeckVisibility: deckState.selectedDeck.visibility,
            lobbyDeckTitle:
              deckState.selectedDeck.visibility === "private"
                ? text.settings.privateDeck
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
      text.settings.privateDeck,
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

  // Fall back to solo mode when multiplayer connection is unavailable.
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
      const timeout = scheduleYeonTimeout(() => {
        setFallbackToSolo(true);
      }, CONNECTION_TIMEOUT_MS);
      return () => clearYeonTimeout(timeout);
    }
  }, [race.connectionState]);

  const refreshQuickRaceSeed = useCallback(() => {
    setFallbackToSolo(false);
    setSeedRefreshToken((value) => value + 1);
  }, []);

  const retryMultiplayer = () => {
    refreshQuickRaceSeed();
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
      <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
        <TypingServiceHeader active="race" title={text.header.raceTitle} />
        <YeonView className="flex min-h-[calc(100vh-76px)] items-center justify-center">
          <YeonView
            className={`flex flex-col items-center gap-3 font-mono ${SHARED_FEATURE_CLASS.text13Soft}`}
          >
            <YeonView className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
            <YeonText as="span" variant="unstyled" tone="inherit">
              {t("connectingToServer")}
            </YeonText>
          </YeonView>
        </YeonView>
      </YeonView>
    );
  }

  return (
    <TypingRaceMultiplayerScreen race={race} onRestart={refreshQuickRaceSeed} />
  );
}
