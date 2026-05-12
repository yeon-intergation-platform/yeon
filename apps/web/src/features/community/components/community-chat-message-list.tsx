"use client";

import type { RefObject } from "react";

import type { CommunityChatMessage } from "../community-chat-api";
import {
  formatCommunityChatMessageTime,
  trimCommunityChatDisplayText,
} from "./community-chat-format";

type CommunityChatMessageListProps = {
  refObject: RefObject<HTMLDivElement | null>;
  messages: readonly CommunityChatMessage[];
  isLoading: boolean;
  error: string | null;
  compact: boolean;
  feed: boolean;
};

export function CommunityChatMessageList({
  refObject,
  messages,
  isLoading,
  error,
  compact,
  feed,
}: CommunityChatMessageListProps) {
  return (
    <div
      ref={refObject}
      className={[
        feed
          ? "border-y border-[#eff3f4] bg-white py-3"
          : "rounded-xl border border-[#eee] bg-[#fafafa] p-2.5",
        compact ? "h-[240px]" : feed ? "h-[280px]" : "h-[420px]",
        "overflow-y-auto overscroll-contain",
      ].join(" ")}
    >
      {isLoading ? (
        <p className="text-[12px] text-[#777]">채팅을 불러오는 중...</p>
      ) : null}

      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}

      {!isLoading && messages.length === 0 ? (
        <p className="px-1 py-8 text-center text-[13px] font-semibold text-[#777]">
          아직 채팅이 없습니다. 첫 메시지를 남겨보세요.
        </p>
      ) : (
        <div className="space-y-1.5">
          {messages.map((message) => (
            <div
              key={message.id}
              className="grid grid-cols-[78px_48px_minmax(0,1fr)] items-baseline gap-2 text-[13px] leading-[1.55]"
            >
              <span className="truncate font-semibold text-[#555]">
                {message.senderNickname}
              </span>
              <span className="font-mono text-[10px] text-[#999]">
                {formatCommunityChatMessageTime(message.createdAt)}
              </span>
              <span className="truncate text-[#111]">
                {trimCommunityChatDisplayText(message.body)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
