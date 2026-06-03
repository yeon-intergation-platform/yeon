"use client";
import type { TypingRoomSnapshot } from "@yeon/race-shared";
import { YeonButton, YeonField, YeonIcon, YeonText, YeonView } from "@yeon/ui";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

type TypingRoomChatPanelProps = {
  messages: TypingRoomSnapshot["messages"];
  chatDraft: string;
  chatError: string | null;
  canSendChat: boolean;
  onChatDraftChange: (value: string) => void;
  onChatSubmit: () => void;
};

export function TypingRoomChatPanel({
  messages,
  chatDraft,
  chatError,
  canSendChat,
  onChatDraftChange,
  onChatSubmit,
}: TypingRoomChatPanelProps) {
  const hasMessages = messages.length > 0;

  return (
    <YeonView
      as="section"
      className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-3"
    >
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className={TYPING_SERVICE_COMMON_CLASS.panelSubheading}
      >
        채팅
      </YeonText>
      <YeonView className="h-[260px] overflow-y-auto rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:h-[320px] xl:h-[300px]">
        {!hasMessages && (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[12px] leading-5 text-[#aaa]"
          >
            아직 메시지가 없습니다.
          </YeonText>
        )}
        {messages.map((message) => (
          <YeonView key={message.id} className="mb-2 text-[12px]">
            {message.messageType === "system" ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="text-[#aaa]"
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="font-semibold"
                >
                  [시스템]
                </YeonText>{" "}
                {message.content}
              </YeonText>
            ) : (
              <YeonText as="p" variant="unstyled" tone="inherit">
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="font-semibold"
                >
                  {message.senderLabel ?? "참가자"}:
                </YeonText>{" "}
                {message.content}
              </YeonText>
            )}
          </YeonView>
        ))}
      </YeonView>
      <YeonView className="mt-3 flex gap-2">
        <YeonField
          value={chatDraft}
          onChange={(event) => onChatDraftChange(event.target.value)}
          placeholder="메시지 입력"
          className="h-9 flex-1 rounded-lg px-3 text-[13px]"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onChatSubmit();
            }
          }}
        />
        <YeonButton
          type="button"
          onClick={onChatSubmit}
          disabled={!canSendChat}
          variant="primary"
          size="sm"
          className="shrink-0 rounded-lg px-3 text-[13px]"
        >
          <YeonIcon name="send" size={14} />
        </YeonButton>
      </YeonView>
      {chatError && (
        <YeonText
          as="p"
          variant="caption"
          tone="primary"
          className="mt-2 font-semibold"
        >
          {chatError}
        </YeonText>
      )}
    </YeonView>
  );
}
