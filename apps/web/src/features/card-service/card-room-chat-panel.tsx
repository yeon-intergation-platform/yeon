"use client";

import type { FormEvent } from "react";
import { Send } from "lucide-react";
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitChat();
  };

  return (
    <section
      className={`${mobileTab === "card" ? "hidden lg:flex" : "flex"} min-h-[560px] flex-col rounded-3xl border border-[#e5e5e5] bg-white`}
    >
      <div className="border-b border-[#e5e5e5] p-4">
        <h2 className="text-[16px] font-bold text-[#111]">답변 채팅</h2>
        <p className="mt-1 text-[13px] text-[#777]">
          메시지는 race-server를 통해 브로드캐스트되고 Spring 카드방 메시지로
          저장됩니다.
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((message) => {
          const mine = message.senderParticipantId === participantId;
          return (
            <div
              key={message.id}
              className={`rounded-2xl px-4 py-3 ${mine ? "ml-auto max-w-[78%] bg-[#111] text-white" : message.messageType === "system" ? "mx-auto max-w-[88%] border border-[#e5e5e5] bg-[#fafafa] text-center text-[#666]" : "mr-auto max-w-[78%] border border-[#e5e5e5] bg-white text-[#111]"}`}
            >
              <p className="text-[11px] font-bold opacity-70">
                {message.senderNickname ?? "시스템"}
              </p>
              <p className="mt-1 text-[14px] leading-[1.6]">
                {message.content}
              </p>
            </div>
          );
        })}
      </div>
      <form
        className="flex gap-2 border-t border-[#e5e5e5] p-4"
        onSubmit={handleSubmit}
      >
        <input
          value={chatDraft}
          onChange={(event) => onChatDraftChange(event.target.value)}
          placeholder="답변을 입력하세요"
          className="h-12 min-w-0 flex-1 rounded-xl border border-[#d9d9d9] px-4 text-[14px] outline-none focus:border-[#111]"
        />
        <button
          type="submit"
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#111] text-white transition-colors hover:bg-[#333]"
          aria-label="채팅 보내기"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
