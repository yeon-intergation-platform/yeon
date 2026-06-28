"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreateCardRoomBody } from "@yeon/api-contract/card-rooms";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { writeYeonSessionStorageItem } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { findCharacter } from "@/features/typing-service/characters";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import { useTypingSettings } from "@/features/typing-service/use-typing-settings";
import { getGuestDeckDetail } from "@/lib/guest-card-service-store";
import { useIsAuthenticated } from "./auth-context";
import { createCardRoom, useCardRoomProfile, useDeckList } from "./hooks";

export type CardRoomCreateVisibility = "public" | "private";

const CARD_ROOM_CREATE_EMPTY_DECKS: CardDeckDto[] = [];

type UseCardRoomCreateFormStateOptions = {
  onCreated?: (roomId: string) => void;
};

function getCardRoomCreateErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `카드방을 만들지 못했습니다. 원인: ${error.trim()}`;
  }

  return `카드방을 만들지 못했습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

async function createGuestCardRoomPayload(
  title: string,
  visibility: CardRoomCreateVisibility,
  selectedDeckId: string,
  profile: CreateCardRoomBody["profile"]
): Promise<CreateCardRoomBody> {
  const detail = await getGuestDeckDetail(selectedDeckId);
  if (!detail || detail.items.length === 0) {
    throw new Error("카드가 있는 게스트 덱이 필요합니다.");
  }

  return {
    title,
    visibility,
    guestDeck: {
      title: detail.deck.title,
      items: detail.items.map((item) => ({
        frontText: item.frontText,
        backText: item.backText,
      })),
    },
    profile,
  };
}

function saveCardRoomParticipantSession(
  roomId: string,
  participantId?: string,
  participantToken?: string
) {
  if (!participantId) {
    return;
  }

  writeYeonSessionStorageItem(
    `yeon-card-room-participant:${roomId}`,
    participantId
  );

  if (participantToken) {
    writeYeonSessionStorageItem(
      `yeon-card-room-participant-token:${roomId}`,
      participantToken
    );
  }
}

export function useCardRoomCreateFormState({
  onCreated,
}: UseCardRoomCreateFormStateOptions) {
  const router = useYeonRouter();
  const [title, setTitle] = useState("서로 확인하는 카드방");
  const [visibility, setVisibility] =
    useState<CardRoomCreateVisibility>("public");
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    profile,
    guestId,
    loaded: profileLoaded,
    setProfile,
  } = useCardRoomProfile();
  const [nickname, setNickname] = useState(profile.nickname);
  const isAuthenticated = useIsAuthenticated();
  const decksQuery = useDeckList();
  const decks = decksQuery.data
    ? decksQuery.data
    : CARD_ROOM_CREATE_EMPTY_DECKS;
  const { settings } = useTypingSettings();
  const frameOverrides = useCharacterFrameOverrides();
  const character = findCharacter(profile.characterId);
  const deckSelectPlaceholder = decksQuery.isLoading
    ? "덱 불러오는 중"
    : "덱 선택";
  // 덱 로딩이 끝났는데 덱이 하나도 없으면 막다른 길 대신 덱 생성 안내를 보여준다(#27).
  const showNoDeckGuide = !decksQuery.isLoading && decks.length === 0;

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId) ?? decks[0],
    [decks, selectedDeckId]
  );

  useEffect(() => {
    if (profileLoaded) {
      setNickname(profile.nickname);
    }
  }, [profile.nickname, profileLoaded]);

  async function submit() {
    if (isSubmitting) {
      return;
    }

    if (!profileLoaded) {
      setErrorMessage("카드방 프로필을 불러오는 중입니다.");
      return;
    }

    if (!selectedDeck) {
      setErrorMessage("카드가 있는 덱을 먼저 만들어 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const roomTitle = title.trim() || "카드방";
    const nextProfile = {
      nickname: nickname.trim() || "Guest",
      characterId: profile.characterId,
    };
    setProfile(nextProfile);

    try {
      const payload: CreateCardRoomBody = isAuthenticated
        ? {
            title: roomTitle,
            visibility,
            deckId: selectedDeck.id,
            profile: nextProfile,
          }
        : await createGuestCardRoomPayload(
            roomTitle,
            visibility,
            selectedDeck.id,
            nextProfile
          );
      const created = await createCardRoom(payload, guestId);
      saveCardRoomParticipantSession(
        created.room.id,
        created.participant?.id,
        created.participantToken ?? undefined
      );

      if (onCreated) {
        onCreated(created.room.id);
      } else {
        router.push(
          resolveYeonWebPath("cardRoomDetail", { roomId: created.room.id })
        );
      }
    } catch (error) {
      setErrorMessage(getCardRoomCreateErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToDecks() {
    router.push("/card-service/decks");
  }

  function goToLobby() {
    router.push(resolveYeonWebPath("cardRoomList"));
  }

  return {
    title,
    setTitle,
    visibility,
    setVisibility,
    selectedDeck,
    selectedDeckId,
    setSelectedDeckId,
    isSubmitting,
    errorMessage,
    profile,
    profileLoaded,
    nickname,
    setNickname,
    decks,
    decksQuery,
    deckSelectPlaceholder,
    showNoDeckGuide,
    settings,
    frameOverrides,
    character,
    submit,
    goToDecks,
    goToLobby,
  };
}
