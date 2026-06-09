import {
  YeonActionButton as ActionButton,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
} from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "../card-service-copy";
import {
  CardRoomChatSection,
  CardRoomHeader,
  CardRoomParticipantsSection,
  FinishedCardRoomPanel,
  StudyCardSection,
  WaitingControls,
} from "./card-room-screen-sections";
import { useCardRoomScreenState } from "./use-card-room-screen-state";

const T = CARD_SERVICE_TEXT.rooms;

type CardRoomScreenProps = { roomId: string };

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
  const {
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
  } = useCardRoomScreenState(roomId);

  if (joinError) {
    // idx-116: 재시도 버튼 제공 — joinError를 null로 리셋해 effect를 재실행.
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock message={joinError} title={T.joinErrorTitle} />
        <ActionButton label={T.retryLabel} onPress={retryJoin} variant="dark" />
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

  if (!roomView) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock loading message={T.connecting} title={T.lobbyTitle} />
      </MobileScreen>
    );
  }

  const { state } = roomView;

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

        {roomView.isWaiting ? (
          <WaitingControls
            canStart={roomView.canStart}
            isHost={roomView.isHost}
            isReady={roomView.isReady}
            myRole={roomView.myRole}
            onChooseRole={chooseRole}
            onReadyToggle={toggleReady}
            onStart={handleStart}
          />
        ) : roomView.isFinished ? (
          <FinishedCardRoomPanel onLeave={handleLeave} />
        ) : roomView.currentCard ? (
          <StudyCardSection
            card={roomView.currentCard}
            currentCardIndex={state.currentCardIndex}
            isChecker={roomView.isChecker}
            isRevealed={roomView.isRevealed}
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
