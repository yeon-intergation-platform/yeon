"use client";

import type { RefObject } from "react";

import type { CommunityChatMessage } from "../community-chat-api";
import {
  formatCommunityChatMessageTime,
  trimCommunityChatDisplayText,
} from "./community-chat-format";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

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
        <p className={SHARED_FEATURE_CLASS.text12Subtle}>
          채팅을 불러오는 중...
        </p>
      ) : null}

      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}

      {!isLoading && messages.length === 0 ? (
        <p
          className={`px-1 py-8 text-center ${SHARED_FEATURE_CLASS.text13EmphasisSubtle}`}
        >
          아직 채팅이 없습니다. 첫 메시지를 남겨보세요.
        </p>
      ) : (
        <div className="space-y-1.5">
          {messages.map((message, index) => {
            const previous = index > 0 ? messages[index - 1] : null;
            const isGroupedWithPrevious =
              previous?.senderId === message.senderId;

            return (
              <div
                key={message.id}
                className={[
                  "text-[13px] leading-[1.55]",
                  isGroupedWithPrevious ? "" : "pt-1.5 first:pt-0",
                ].join(" ")}
              >
                {isGroupedWithPrevious ? null : (
                  <span className="block truncate font-semibold text-[#555]">
                    {message.senderNickname}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-[#111]">
                    {trimCommunityChatDisplayText(message.body)}
                  </span>
                  <time
                    dateTime={message.createdAt}
                    className="shrink-0 font-mono text-[10px] text-[#999]"
                  >
                    {formatCommunityChatMessageTime(message.createdAt)}
                  </time>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
