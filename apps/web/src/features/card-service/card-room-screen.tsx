"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import { RoomVoiceCallPanel } from "@/features/room-voice-call/room-voice-call-panel";
import { CardRoomChatPanel } from "./card-room-chat-panel";
import { CardRoomHeader } from "./card-room-header";
import { CardRoomParticipantsPanel } from "./card-room-participants-panel";
import { CardRoomStudyPanel } from "./card-room-study-panel";
import { useCardRoomScreenState } from "./use-card-room-screen-state";

type CardRoomScreenProps = { roomId: string };

export function CardRoomScreen({ roomId }: CardRoomScreenProps) {
  const screen = useCardRoomScreenState(roomId);

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader activeService="card" />
      <YeonView as="main" className="px-4 py-5 md:px-8 md:py-6">
        <CardRoomHeader
          roomId={roomId}
          state={screen.state}
          connectionState={screen.room.connectionState}
          myParticipant={screen.myParticipant}
          canStart={screen.canStart}
          onRoleChange={screen.room.sendRole}
          onReadyChange={screen.room.sendReady}
          onStart={screen.room.sendStart}
          onEnd={screen.room.sendEnd}
          onLeave={screen.leaveRoom}
        />

        {screen.joinError || screen.room.error ? (
          <YeonText
            as="p"
            variant="caption"
            tone="primary"
            className="mt-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 font-bold"
          >
            {screen.joinError ?? screen.room.error}
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
                  onClick={() => screen.setMobileTab(tab)}
                  variant={screen.mobileTab === tab ? "primary" : "ghost"}
                  size="md"
                  className={`flex-1 rounded-lg px-3 py-2 ${SHARED_FEATURE_CLASS.text13MediumSecondary}`}
                >
                  {tab === "card" ? "카드" : "채팅"}
                </YeonButton>
              ))}
            </YeonView>
            <YeonView
              className={`${screen.mobileTab === "chat" ? "hidden lg:block" : "block"}`}
            >
              <YeonView className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <CardRoomParticipantsPanel
                  participants={screen.state?.participants ?? null}
                  participantId={screen.participantId}
                  frameOverrides={screen.frameOverrides}
                />
                <RoomVoiceCallPanel voiceCall={screen.voiceCall} />
                <CardRoomStudyPanel
                  state={screen.state}
                  currentCard={screen.currentCard}
                  isChecker={screen.isChecker}
                  isMemorizer={screen.isMemorizer}
                  shouldShowBack={screen.shouldShowBack}
                  canMoveNext={screen.canMoveNext}
                  onReveal={screen.room.sendReveal}
                  onResult={screen.room.sendResult}
                  onNext={screen.room.sendNext}
                />
              </YeonView>
            </YeonView>
          </YeonView>

          <CardRoomChatPanel
            mobileTab={screen.mobileTab}
            messages={screen.state?.messages ?? []}
            participantId={screen.participantId}
            chatDraft={screen.chatDraft}
            onChatDraftChange={screen.setChatDraft}
            onSubmitChat={screen.submitChat}
          />
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
