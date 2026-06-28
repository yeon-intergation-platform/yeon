"use client";

import type {
  CardRoomScreenMobileTab,
  useCardRoomScreenState,
} from "./use-card-room-screen-state";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { isCardRoomWaiting } from "@yeon/race-shared";
import { YeonButton, YeonText, YeonView } from "@yeon/ui";
import { RoomVoiceCallPanel } from "@/features/room-voice-call/room-voice-call-panel";
import { CardRoomChatPanel } from "./card-room-chat-panel";
import { CardRoomParticipantsPanel } from "./card-room-participants-panel";
import { CardRoomStudyPanel } from "./card-room-study-panel";

type CardRoomScreenState = ReturnType<typeof useCardRoomScreenState>;

type CardRoomScreenPartProps = {
  screen: CardRoomScreenState;
};

const CARD_ROOM_SCREEN_MOBILE_TABS = ["card", "chat"] as const;

export function CardRoomScreenError({ screen }: CardRoomScreenPartProps) {
  const message = screen.joinError ?? screen.room.error;
  if (!message) {
    return null;
  }

  return (
    <YeonText
      as="p"
      variant="caption"
      tone="primary"
      className="mt-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 font-bold"
    >
      {message}
    </YeonText>
  );
}

export function CardRoomScreenWorkspace({ screen }: CardRoomScreenPartProps) {
  return (
    <YeonView as="section" className="mt-4 grid gap-4 lg:grid-cols-[35fr_65fr]">
      <CardRoomScreenSidePanel screen={screen} />
      <CardRoomChatPanel
        mobileTab={screen.mobileTab}
        messages={screen.state?.messages ?? []}
        participantId={screen.participantId}
        chatDraft={screen.chatDraft}
        onChatDraftChange={screen.setChatDraft}
        onSubmitChat={screen.submitChat}
      />
    </YeonView>
  );
}

function CardRoomScreenSidePanel({ screen }: CardRoomScreenPartProps) {
  return (
    <YeonView
      as="section"
      className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:p-4"
    >
      <CardRoomScreenMobileTabs
        activeTab={screen.mobileTab}
        onTabChange={screen.setMobileTab}
      />
      <YeonView
        className={`${screen.mobileTab === "chat" ? "hidden lg:block" : "block"}`}
      >
        <YeonView className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <CardRoomParticipantsPanel
            participants={screen.state?.participants ?? null}
            participantId={screen.participantId}
            frameOverrides={screen.frameOverrides}
          />
          {/* 음성통화는 대기중에만 노출한다. 학습(게임) 진행 중에는 숨긴다. */}
          {isCardRoomWaiting(screen.state) ? (
            <RoomVoiceCallPanel voiceCall={screen.voiceCall} />
          ) : null}
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
  );
}

type CardRoomScreenMobileTabsProps = {
  activeTab: CardRoomScreenMobileTab;
  onTabChange: (tab: CardRoomScreenMobileTab) => void;
};

function CardRoomScreenMobileTabs({
  activeTab,
  onTabChange,
}: CardRoomScreenMobileTabsProps) {
  return (
    <YeonView className="mb-3 flex rounded-xl border border-[#e5e5e5] bg-white p-1 lg:hidden">
      {CARD_ROOM_SCREEN_MOBILE_TABS.map((tab) => (
        <YeonButton
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          variant={activeTab === tab ? "primary" : "ghost"}
          size="md"
          className={`flex-1 rounded-lg px-3 py-2 ${SHARED_FEATURE_CLASS.text13MediumSecondary}`}
        >
          {tab === "card" ? "카드" : "채팅"}
        </YeonButton>
      ))}
    </YeonView>
  );
}
