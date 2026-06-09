import type { CardRoomRole } from "@yeon/race-shared";
import { showYeonAlert, useYeonRouter as useRouter } from "@yeon/ui/native";
import { useEffect, useMemo, useState } from "react";

import { cardRoomApi } from "../../../services/card-rooms/client";
import {
  deleteCardRoomParticipantId,
  deleteCardRoomParticipantToken,
  readCardRoomParticipantId,
  readCardRoomParticipantToken,
  writeCardRoomParticipantId,
  writeCardRoomParticipantToken,
} from "../../../services/card-rooms/profile-storage";
import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { getCardServiceErrorMessage } from "../error-message";
import { useCardRoomConnection } from "./use-card-room-connection";
import { useCardRoomIdentity } from "./use-card-room-identity";

const T = CARD_SERVICE_TEXT.rooms;

export function useCardRoomScreenState(roomId: string) {
  const router = useRouter();
  const { profile, guestId, loaded } = useCardRoomIdentity();
  const [participantId, setParticipantId] = useState<string | null>(null);
  // finding 166: race-server 입장 시 participantId 소유를 증명하는 토큰.
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState("");

  // 입장: 저장된 참가자 ID가 있으면 재사용, 없으면 REST join.
  useEffect(() => {
    if (!loaded || !profile || !guestId || participantId) return;
    let cancelled = false;
    void (async () => {
      const stored = await readCardRoomParticipantId(roomId);
      if (stored) {
        const storedToken = await readCardRoomParticipantToken(roomId);
        if (!cancelled) {
          setParticipantToken(storedToken);
          setParticipantId(stored);
        }
        return;
      }
      try {
        const response = await cardRoomApi.joinRoom(
          roomId,
          { profile },
          guestId
        );
        await writeCardRoomParticipantId(roomId, response.participant.id);
        const token = response.participantToken ?? null;
        if (token) {
          await writeCardRoomParticipantToken(roomId, token);
        } else {
          await deleteCardRoomParticipantToken(roomId);
        }
        if (!cancelled) {
          setParticipantToken(token);
          setParticipantId(response.participant.id);
        }
      } catch (error) {
        if (!cancelled) {
          setJoinError(getCardServiceErrorMessage(error, T.joinErrorTitle));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaded, profile, guestId, participantId, roomId]);

  const connection = useCardRoomConnection(
    roomId,
    participantId,
    participantToken
  );
  const state = connection.state;

  // idx-112: stale participantId 복구 — 서버 participants에 내 ID가 없으면 저장된 ID를
  // 삭제하고 setParticipantId(null)로 REST join을 재시도(토큰도 함께 정리).
  useEffect(() => {
    if (!state || !participantId) return;
    const exists = state.participants.some((p) => p.id === participantId);
    if (exists) return;
    void deleteCardRoomParticipantId(roomId);
    void deleteCardRoomParticipantToken(roomId);
    setParticipantToken(null);
    setParticipantId(null);
  }, [state, participantId, roomId]);

  // idx-113: 퇴장 시 서버에 LEAVE 이벤트 전송 + 저장된 participantId/토큰 정리.
  function handleLeave() {
    if (participantId) {
      connection.sendLeave();
      void deleteCardRoomParticipantId(roomId);
      void deleteCardRoomParticipantToken(roomId);
    }
    router.back();
  }

  const roomView = useMemo(() => {
    if (!state) return null;
    const me = state.participants.find((p) => p.id === participantId) ?? null;
    const myRole = me?.role ?? "MEMORIZER";
    const isHost = me?.isHost ?? false;
    const currentCard = state.cards[state.currentCardIndex] ?? null;
    const isChecker = myRole === "CHECKER";
    const isWaiting = state.status === "waiting";
    const isFinished = state.status === "finished" || state.status === "closed";
    // finding 20: 뒷면 공개는 방 status가 아니라 현재 카드의 공개/확정 상태로 판정한다.
    const isRevealed =
      state.currentCardRevealed || state.currentCardResult !== null;
    // idx-126: web canStart와 동등한 조건으로 클라이언트 검증(서버 에러 의존 최소화).
    const canStart = Boolean(
      isWaiting &&
      isHost &&
      state.cards.length > 0 &&
      state.participants.some((p) => p.role === "MEMORIZER") &&
      state.participants.some((p) => p.role === "CHECKER") &&
      state.participants.every((p) => p.isReady)
    );

    return {
      canStart,
      currentCard,
      isChecker,
      isFinished,
      isHost,
      isReady: me?.isReady ?? false,
      isRevealed,
      isWaiting,
      myRole,
      state,
    };
  }, [participantId, state]);

  function retryJoin() {
    setJoinError(null);
  }

  function sendChat() {
    const content = chatDraft.trim();
    if (!content) return;
    connection.sendChat(content);
    setChatDraft("");
  }

  function chooseRole(role: CardRoomRole) {
    connection.sendRole(role);
  }

  function toggleReady() {
    connection.sendReady(!(roomView?.isReady ?? false));
  }

  function handleStart() {
    // idx-126: 호스트 여부 + 역할/준비/카드 조건 클라이언트 검증.
    if (!roomView?.isHost) {
      showYeonAlert(T.waitingTitle, T.hostOnlyStart);
      return;
    }
    if (!roomView.canStart) {
      showYeonAlert(T.waitingTitle, T.startNotReadyHint);
      return;
    }
    connection.sendStart();
  }

  return {
    chatDraft,
    chooseRole,
    connection,
    handleLeave,
    handleStart,
    joinError,
    retryJoin,
    roomView,
    sendChat,
    setChatDraft,
    toggleReady,
  };
}
