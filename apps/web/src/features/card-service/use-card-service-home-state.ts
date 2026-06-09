"use client";
import { useCallback, useMemo, useState } from "react";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useTypingProfile } from "@/features/typing-service/use-typing-profile";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { useIsAuthenticated } from "./auth-context";
import { useDeckList } from "./hooks";

export const CARD_SERVICE_HOME_DECK_ACTION = {
  loading: "loading",
  list: "list",
  create: "create",
} as const;

type CardServiceHomeDeckAction =
  (typeof CARD_SERVICE_HOME_DECK_ACTION)[keyof typeof CARD_SERVICE_HOME_DECK_ACTION];

function getDeckAction(
  isDeckStateLoading: boolean,
  shouldShowDeckListAction: boolean
): CardServiceHomeDeckAction {
  if (isDeckStateLoading) {
    return CARD_SERVICE_HOME_DECK_ACTION.loading;
  }

  return shouldShowDeckListAction
    ? CARD_SERVICE_HOME_DECK_ACTION.list
    : CARD_SERVICE_HOME_DECK_ACTION.create;
}

export function useCardServiceHomeState() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { profile, updateProfile, loaded } = useTypingProfile();
  const { settings } = useTypingSettings();
  const decksQuery = useDeckList();
  const hasDecks = (decksQuery.data?.length ?? 0) > 0;
  const isDeckStateLoading = decksQuery.isPending;
  const shouldShowDeckListAction = decksQuery.isError || hasDecks;
  const deckAction = getDeckAction(
    isDeckStateLoading,
    shouldShowDeckListAction
  );

  const trackHomeClick = useCallback(
    (target: string) => {
      trackEvent(analyticsEvents.cardDeckOpen, {
        source: "card_room_home",
        target,
        authenticated: isAuthenticated,
        has_profile: loaded,
        character_id: profile.characterId,
      });
    },
    [isAuthenticated, loaded, profile.characterId]
  );

  const openCreate = useCallback(() => {
    setCreateOpen(true);
    trackEvent(analyticsEvents.cardDeckCreateOpen, {
      source: "card_room_home",
      authenticated: isAuthenticated,
      character_id: profile.characterId,
    });
  }, [isAuthenticated, profile.characterId]);

  const profileActions = useMemo(
    () => ({
      onNicknameChange: (nickname: string) => updateProfile({ nickname }),
      onCharacterChange: (characterId: string) =>
        updateProfile({ characterId }),
    }),
    [updateProfile]
  );

  return {
    isAuthenticated,
    profile,
    profileLoaded: loaded,
    profileActions,
    locale: settings.locale,
    deckAction,
    isDeckListError: decksQuery.isError,
    isCreateOpen,
    isSettingsOpen,
    openCreate,
    closeCreate: () => setCreateOpen(false),
    openSettings: () => setSettingsOpen(true),
    closeSettings: () => setSettingsOpen(false),
    trackHomeClick,
  };
}

export type CardServiceHomeState = ReturnType<typeof useCardServiceHomeState>;
