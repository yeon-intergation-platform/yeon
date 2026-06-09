"use client";

import type { CardRoomRealtimeState } from "@yeon/race-shared";
import { YeonView } from "@yeon/ui";

import {
  CardRoomChatComposer,
  CardRoomChatMessageList,
  CardRoomChatPanelHeader,
  getCardRoomChatPanelClass,
} from "./card-room-chat-panel-parts";

type CardRoomChatPanelProps = {
  mobileTab: "card" | "chat";
  messages: CardRoomRealtimeState["messages"];
  participantId: string | null;
  chatDraft: string;
  onChatDraftChange: (value: string) => void;
  onSubmitChat: () => void;
};

export function CardRoomChatPanel({
  mobileTab,
  messages,
  participantId,
  chatDraft,
  onChatDraftChange,
  onSubmitChat,
}: CardRoomChatPanelProps) {
  return (
    <YeonView as="section" className={getCardRoomChatPanelClass(mobileTab)}>
      <CardRoomChatPanelHeader />
      <CardRoomChatMessageList
        messages={messages}
        participantId={participantId}
      />
      <CardRoomChatComposer
        chatDraft={chatDraft}
        onChatDraftChange={onChatDraftChange}
        onSubmitChat={onSubmitChat}
      />
    </YeonView>
  );
}
