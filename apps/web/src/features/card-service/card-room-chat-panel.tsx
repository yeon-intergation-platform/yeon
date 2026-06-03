"use client";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonForm,
  YeonView,
  YeonText,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import type { CardRoomRealtimeState } from "@yeon/race-shared";

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
  const handleSubmit = (event: YeonFormEvent<YeonFormElement>) => {
    event.preventDefault();
    onSubmitChat();
  };

  return (
    <YeonView
      as="section"
      className={`${mobileTab === "card" ? "hidden lg:flex" : "flex"} min-h-[560px] flex-col rounded-3xl border border-[#e5e5e5] bg-white`}
    >
      <YeonView className="border-b border-[#e5e5e5] p-4">
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="text-[16px] font-bold text-[#111]"
        >
          답변 채팅
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-1 ${SHARED_FEATURE_CLASS.text13Subtle}`}
        >
          메시지는 실시간으로 공유되고 카드방 기록에 저장됩니다.
        </YeonText>
      </YeonView>
      <YeonView
        className="flex-1 space-y-3 overflow-y-auto p-4"
        aria-live="polite"
      >
        {messages.map((message) => {
          const mine = message.senderParticipantId === participantId;
          return (
            <YeonView
              key={message.id}
              className={`rounded-2xl px-4 py-3 ${mine ? "ml-auto max-w-[78%] bg-[#111] text-white" : message.messageType === "system" ? "mx-auto max-w-[88%] border border-[#e5e5e5] bg-[#fafafa] text-center text-[#666]" : "mr-auto max-w-[78%] border border-[#e5e5e5] bg-white text-[#111]"}`}
            >
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="text-[11px] font-bold opacity-70"
              >
                {message.senderNickname ?? "시스템"}
              </YeonText>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-1 text-[14px] leading-[1.6]"
              >
                {message.content}
              </YeonText>
            </YeonView>
          );
        })}
      </YeonView>
      <YeonForm
        className="flex gap-2 border-t border-[#e5e5e5] p-4"
        onSubmit={handleSubmit}
      >
        <YeonField
          value={chatDraft}
          onChange={(event) => onChatDraftChange(event.target.value)}
          placeholder="답변을 입력하세요"
          className="h-12 min-w-0 flex-1 rounded-xl px-4 text-[14px]"
        />
        <YeonButton
          type="submit"
          variant="primary"
          size="icon"
          className="h-12 w-12 rounded-xl"
          aria-label="채팅 보내기"
        >
          <YeonIcon name="send" size={18} />
        </YeonButton>
      </YeonForm>
    </YeonView>
  );
}
