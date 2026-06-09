"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CARD_ROOM_ROLE,
  CARD_ROOM_STATUS,
} from "@yeon/api-contract/card-rooms";
import {
  readYeonSessionStorageItem,
  removeYeonSessionStorageItem,
  writeYeonSessionStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { useRoomVoiceCall } from "@/features/room-voice-call/use-room-voice-call";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import {
  joinCardRoom,
  useCardRoomConnection,
  useCardRoomProfile,
} from "./hooks";

export type CardRoomScreenMobileTab = "card" | "chat";

function getCardRoomJoinErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `카드방에 입장하지 못했습니다. 원인: ${error.trim()}`;
  }

  return `카드방에 입장하지 못했습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

function getCardRoomParticipantStorageKey(roomId: string) {
  return `yeon-card-room-participant:${roomId}`;
}

function getCardRoomParticipantTokenStorageKey(roomId: string) {
  return `yeon-card-room-participant-token:${roomId}`;
}

function clearCardRoomParticipantSession(roomId: string) {
  removeYeonSessionStorageItem(getCardRoomParticipantStorageKey(roomId));
  removeYeonSessionStorageItem(getCardRoomParticipantTokenStorageKey(roomId));
}

export function useCardRoomScreenState(roomId: string) {
  const { profile, guestId, loaded: profileLoaded } = useCardRoomProfile();
  const [participantId, setParticipantId] = useState<string | null>(null);
  // finding 166: race-server 입장 시 participantId 소유를 증명하는 토큰.
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<CardRoomScreenMobileTab>("card");
  const [chatDraft, setChatDraft] = useState("");
  const room = useCardRoomConnection(roomId, participantId, participantToken);
  const frameOverrides = useCharacterFrameOverrides();

  useEffect(() => {
    if (!profileLoaded) {
      return;
    }

    const key = getCardRoomParticipantStorageKey(roomId);
    const tokenKey = getCardRoomParticipantTokenStorageKey(roomId);
    const existing = readYeonSessionStorageItem(key);
    if (existing) {
      setParticipantToken(readYeonSessionStorageItem(tokenKey));
      setParticipantId(existing);
      return;
    }

    let cancelled = false;
    joinCardRoom(roomId, { profile }, guestId)
      .then((joined) => {
        if (cancelled) {
          return;
        }

        writeYeonSessionStorageItem(key, joined.participant.id);
        const token = joined.participantToken ?? null;
        if (token) {
          writeYeonSessionStorageItem(tokenKey, token);
        } else {
          removeYeonSessionStorageItem(tokenKey);
        }

        setParticipantToken(token);
        setParticipantId(joined.participant.id);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setJoinError(getCardRoomJoinErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [guestId, profile, profileLoaded, roomId]);

  const state = room.state;
  useEffect(() => {
    if (!state || !participantId) {
      return;
    }

    const exists = state.participants.some(
      (participant) => participant.id === participantId
    );
    if (exists) {
      return;
    }

    clearCardRoomParticipantSession(roomId);
    setParticipantToken(null);
    setParticipantId(null);
  }, [participantId, roomId, state]);

  const voiceParticipants = useMemo(() => {
    const participants = state?.participants ? state.participants : [];
    return participants.map((participant) => ({
      id: participant.id,
      label: participant.nickname,
    }));
  }, [state]);
  const voiceCall = useRoomVoiceCall({
    room: room.room,
    localParticipantId: participantId,
    participants: voiceParticipants,
  });
  const myParticipant =
    state?.participants.find(
      (participant) => participant.id === participantId
    ) ?? null;
  const currentCard = state?.cards[state.currentCardIndex] ?? null;
  const isChecker = myParticipant?.role === CARD_ROOM_ROLE.CHECKER;
  const isMemorizer = myParticipant?.role === CARD_ROOM_ROLE.MEMORIZER;
  const isWaiting = state?.status === CARD_ROOM_STATUS.WAITING;
  const canStart = Boolean(
    isWaiting &&
    myParticipant?.isHost &&
    state &&
    state.cards.length > 0 &&
    state.participants.some(
      (participant) => participant.role === CARD_ROOM_ROLE.MEMORIZER
    ) &&
    state.participants.some(
      (participant) => participant.role === CARD_ROOM_ROLE.CHECKER
    ) &&
    state.participants.every((participant) => participant.isReady)
  );
  // finding 20: 뒷면 공개는 방 status가 아니라 현재 카드의 공개/확정 상태로 판정한다.
  const isResolved = Boolean(state && state.currentCardResult !== null);
  const isRevealed = Boolean(state?.currentCardRevealed);
  const shouldShowBack = isRevealed || isResolved;
  // 다음 카드로 넘어갈 수 있는지는 현재 카드가 확정(resolved)됐는지로 판정한다.
  const canMoveNext = isResolved;

  function submitChat() {
    const text = chatDraft.trim();
    if (!text) {
      return;
    }

    room.sendChat(text);
    setChatDraft("");
  }

  function leaveRoom() {
    if (!participantId) {
      return;
    }

    clearCardRoomParticipantSession(roomId);
    room.sendLeave();
  }

  return {
    room,
    state,
    participantId,
    joinError,
    mobileTab,
    setMobileTab,
    chatDraft,
    setChatDraft,
    frameOverrides,
    voiceCall,
    myParticipant,
    currentCard,
    isChecker,
    isMemorizer,
    canStart,
    shouldShowBack,
    canMoveNext,
    submitChat,
    leaveRoom,
  };
}
