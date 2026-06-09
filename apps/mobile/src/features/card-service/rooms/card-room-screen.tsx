import type { CardRoomRole } from "@yeon/race-shared";
import { useYeonRouter as useRouter } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
  showYeonAlert,
} from "@yeon/ui/native";
import { useEffect, useState } from "react";
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
import {
  CardRoomChatSection,
  CardRoomHeader,
  CardRoomParticipantsSection,
  FinishedCardRoomPanel,
  StudyCardSection,
  WaitingControls,
} from "./card-room-screen-sections";
import { useCardRoomConnection } from "./use-card-room-connection";
import { useCardRoomIdentity } from "./use-card-room-identity";

const T = CARD_SERVICE_TEXT.rooms;

type CardRoomScreenProps = { roomId: string };

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
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

  if (joinError) {
    // idx-116: 재시도 버튼 제공 — joinError를 null로 리셋해 effect를 재실행.
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock message={joinError} title={T.joinErrorTitle} />
        <ActionButton
          label={T.retryLabel}
          onPress={() => setJoinError(null)}
          variant="dark"
        />
      </MobileScreen>
    );
  }

  if (connection.connectionState === "error" && connection.error) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock message={connection.error} title={T.connectionErrorTitle} />
      </MobileScreen>
    );
  }

  // idx-115: 연결 끊김 상태를 사용자에게 알리는 UI 추가.
  if (connection.connectionState === "disconnected") {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          message={T.disconnectedMessage}
          title={T.connectionErrorTitle}
        />
        <ActionButton
          label={T.leaveLabel}
          onPress={handleLeave}
          variant="dark"
        />
      </MobileScreen>
    );
  }

  if (!state) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock loading message={T.connecting} title={T.lobbyTitle} />
      </MobileScreen>
    );
  }

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

  function sendChat() {
    const content = chatDraft.trim();
    if (!content) return;
    connection.sendChat(content);
    setChatDraft("");
  }

  function chooseRole(role: CardRoomRole) {
    connection.sendRole(role);
  }

  function handleStart() {
    // idx-126: 호스트 여부 + 역할/준비/카드 조건 클라이언트 검증.
    if (!isHost) {
      showYeonAlert(T.waitingTitle, T.hostOnlyStart);
      return;
    }
    if (!canStart) {
      showYeonAlert(T.waitingTitle, T.startNotReadyHint);
      return;
    }
    connection.sendStart();
  }

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        <CardRoomHeader
          cardCount={state.cards.length}
          deckTitle={state.deckTitle}
          onLeave={handleLeave}
          title={state.title}
        />

        <CardRoomParticipantsSection participants={state.participants} />

        {isWaiting ? (
          <WaitingControls
            canStart={canStart}
            isHost={isHost}
            isReady={me?.isReady ?? false}
            myRole={myRole}
            onChooseRole={chooseRole}
            onReadyToggle={() => connection.sendReady(!(me?.isReady ?? false))}
            onStart={handleStart}
          />
        ) : isFinished ? (
          <FinishedCardRoomPanel onLeave={handleLeave} />
        ) : currentCard ? (
          <StudyCardSection
            card={currentCard}
            currentCardIndex={state.currentCardIndex}
            isChecker={isChecker}
            isRevealed={isRevealed}
            onNext={connection.sendNext}
            onResult={connection.sendResult}
            onReveal={connection.sendReveal}
            totalCards={state.cards.length}
          />
        ) : null}

        <CardRoomChatSection
          chatDraft={chatDraft}
          messages={state.messages}
          onChangeDraft={setChatDraft}
          onSend={sendChat}
        />
      </FormStack>
    </MobileScreen>
  );
}
