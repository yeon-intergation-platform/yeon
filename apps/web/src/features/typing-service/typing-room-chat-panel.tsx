"use client";

import { Send } from "lucide-react";
import type { TypingRoomSnapshot } from "@yeon/race-shared";

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
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-3 xl:order-3">
      <h2 className={TYPING_SERVICE_COMMON_CLASS.panelSubheading}>채팅</h2>
      <div className="h-[260px] overflow-y-auto rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 md:h-[320px] xl:h-[300px]">
        {!hasMessages && (
          <p className="text-[12px] leading-5 text-[#aaa]">
            아직 메시지가 없습니다.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="mb-2 text-[12px]">
            {message.messageType === "system" ? (
              <p className="text-[#999]">
                <span className="font-semibold">[시스템]</span>{" "}
                {message.content}
              </p>
            ) : (
              <p>
                <span className="font-semibold">
                  {message.senderLabel ?? "참가자"}:
                </span>{" "}
                {message.content}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={chatDraft}
          onChange={(event) => onChatDraftChange(event.target.value)}
          placeholder="메시지 입력"
          className="h-9 flex-1 rounded-lg border border-[#d7d7d7] px-3 text-[13px]"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onChatSubmit();
            }
          }}
        />
        <button
          type="button"
          onClick={onChatSubmit}
          disabled={!canSendChat}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#111] px-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#999]"
        >
          <Send size={14} />
        </button>
      </div>
      {chatError && <p className="mt-2 text-[12px] text-[#d33]">{chatError}</p>}
    </section>
  );
}
