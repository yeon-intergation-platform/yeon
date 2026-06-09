"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useEffect, useMemo, useState } from "react";
import {
  CARD_ROOM_ROLE,
  CARD_ROOM_STATUS,
} from "@yeon/api-contract/card-rooms";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import {
  readYeonSessionStorageItem,
  removeYeonSessionStorageItem,
  writeYeonSessionStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { RoomVoiceCallPanel } from "@/features/room-voice-call/room-voice-call-panel";
import { useRoomVoiceCall } from "@/features/room-voice-call/use-room-voice-call";
import { useCharacterFrameOverrides } from "@/features/typing-service/use-character-frame-overrides";
import {
  joinCardRoom,
  useCardRoomConnection,
  useCardRoomProfile,
} from "./hooks";
import { CardRoomChatPanel } from "./card-room-chat-panel";
import { CardRoomHeader } from "./card-room-header";
import { CardRoomParticipantsPanel } from "./card-room-participants-panel";
import { CardRoomStudyPanel } from "./card-room-study-panel";

function getCardRoomJoinErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `카드방에 입장하지 못했습니다. 원인: ${error.trim()}`;
  }

  return `카드방에 입장하지 못했습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

type CardRoomScreenProps = { roomId: string };

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
  const { profile, guestId, loaded: profileLoaded } = useCardRoomProfile();
  const [participantId, setParticipantId] = useState<string | null>(null);
  // finding 166: race-server 입장 시 participantId 소유를 증명하는 토큰.
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"card" | "chat">("card");
  const [chatDraft, setChatDraft] = useState("");
  const room = useCardRoomConnection(roomId, participantId, participantToken);
  const frameOverrides = useCharacterFrameOverrides();

  useEffect(() => {
    if (!profileLoaded) return;
    const key = `yeon-card-room-participant:${roomId}`;
    const tokenKey = `yeon-card-room-participant-token:${roomId}`;
    const existing = readYeonSessionStorageItem(key);
    if (existing) {
      setParticipantToken(readYeonSessionStorageItem(tokenKey));
      setParticipantId(existing);
      return;
    }
    let cancelled = false;
    joinCardRoom(roomId, { profile }, guestId)
      .then((joined) => {
        if (cancelled) return;
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
    if (!state || !participantId) return;
    const exists = state.participants.some(
      (participant) => participant.id === participantId
    );
    if (exists) return;
    removeYeonSessionStorageItem(`yeon-card-room-participant:${roomId}`);
    removeYeonSessionStorageItem(`yeon-card-room-participant-token:${roomId}`);
    setParticipantToken(null);
    setParticipantId(null);
  }, [participantId, roomId, state]);

  const voiceParticipants = useMemo(
    () =>
      (state?.participants ?? []).map((participant) => ({
        id: participant.id,
        label: participant.nickname,
      })),
    [state?.participants]
  );
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
    if (!text) return;
    room.sendChat(text);
    setChatDraft("");
  }
  function leaveRoom() {
    if (participantId) {
      removeYeonSessionStorageItem(`yeon-card-room-participant:${roomId}`);
      removeYeonSessionStorageItem(
        `yeon-card-room-participant-token:${roomId}`
      );
      room.sendLeave();
    }
  }

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <YeonView as="main" className="px-4 py-5 md:px-8 md:py-6">
        <CardRoomHeader
          roomId={roomId}
          state={state}
          connectionState={room.connectionState}
          myParticipant={myParticipant}
          canStart={canStart}
          onRoleChange={room.sendRole}
          onReadyChange={room.sendReady}
          onStart={room.sendStart}
          onEnd={room.sendEnd}
          onLeave={leaveRoom}
        />

        {joinError || room.error ? (
          <YeonText
            as="p"
            variant="caption"
            tone="primary"
            className="mt-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 font-bold"
          >
            {joinError ?? room.error}
          </YeonText>
        ) : null}

        <YeonView
          as="section"
          className="mt-4 grid gap-4 lg:grid-cols-[35fr_65fr]"
        >
          <YeonView
            as="section"
            className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:p-4"
          >
            <YeonView className="mb-3 flex rounded-xl border border-[#e5e5e5] bg-white p-1 lg:hidden">
              {(["card", "chat"] as const).map((tab) => (
                <YeonButton
                  key={tab}
                  type="button"
                  onClick={() => setMobileTab(tab)}
                  variant={mobileTab === tab ? "primary" : "ghost"}
                  size="md"
                  className={`flex-1 rounded-lg px-3 py-2 ${SHARED_FEATURE_CLASS.text13MediumSecondary}`}
                >
                  {tab === "card" ? "카드" : "채팅"}
                </YeonButton>
              ))}
            </YeonView>
            <YeonView
              className={`${mobileTab === "chat" ? "hidden lg:block" : "block"}`}
            >
              <YeonView className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <CardRoomParticipantsPanel
                  participants={state?.participants ?? null}
                  participantId={participantId}
                  frameOverrides={frameOverrides}
                />
                <RoomVoiceCallPanel voiceCall={voiceCall} />
                <CardRoomStudyPanel
                  state={state}
                  currentCard={currentCard}
                  isChecker={isChecker}
                  isMemorizer={isMemorizer}
                  shouldShowBack={shouldShowBack}
                  canMoveNext={canMoveNext}
                  onReveal={room.sendReveal}
                  onResult={room.sendResult}
                  onNext={room.sendNext}
                />
              </YeonView>
            </YeonView>
          </YeonView>

          <CardRoomChatPanel
            mobileTab={mobileTab}
            messages={state?.messages ?? []}
            participantId={participantId}
            chatDraft={chatDraft}
            onChatDraftChange={setChatDraft}
            onSubmitChat={submitChat}
          />
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
