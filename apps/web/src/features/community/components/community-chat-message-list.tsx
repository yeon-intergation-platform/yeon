"use client";
import type { RefObject } from "react";
import type { CommunityChatMessage } from "../community-chat-api";
import {
  formatCommunityChatMessageTime,
  trimCommunityChatDisplayText,
} from "./community-chat-format";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YeonText, YeonView, type YeonElement } from "@yeon/ui";

type CommunityChatMessageListProps = {
  refObject: RefObject<YeonElement | null>;
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
    <YeonView
      ref={refObject}
      className={[
        feed
          ? "border-y border-[#e5e5e5] bg-white py-3"
          : "rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-2.5",
        compact ? "h-[240px]" : feed ? "h-[280px]" : "h-[420px]",
        "overflow-y-auto overscroll-contain",
      ].join(" ")}
    >
      {isLoading ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text12Subtle}
        >
          채팅을 불러오는 중...
        </YeonText>
      ) : null}

      {error ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[12px] text-[#666]"
        >
          {error}
        </YeonText>
      ) : null}

      {!isLoading && messages.length === 0 ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`px-1 py-8 text-center ${SHARED_FEATURE_CLASS.text13EmphasisSubtle}`}
        >
          아직 채팅이 없습니다. 첫 메시지를 남겨보세요.
        </YeonText>
      ) : (
        <YeonView className="space-y-1.5">
          {messages.map((message, index) => {
            const previous = index > 0 ? messages[index - 1] : null;
            const isGroupedWithPrevious =
              previous?.senderId === message.senderId;

            return (
              <YeonView
                key={message.id}
                className={[
                  "text-[13px] leading-[1.55]",
                  isGroupedWithPrevious ? "" : "pt-1.5 first:pt-0",
                ].join(" ")}
              >
                {isGroupedWithPrevious ? null : (
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="block truncate font-semibold text-[#666]"
                  >
                    {message.senderNickname}
                  </YeonText>
                )}
                <YeonView className="flex items-baseline gap-2">
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-[#111]"
                  >
                    {trimCommunityChatDisplayText(message.body)}
                  </YeonText>
                  <YeonText
                    as="time"
                    variant="unstyled"
                    tone="inherit"
                    dateTime={message.createdAt}
                    className="shrink-0 font-mono text-[10px] text-[#aaa]"
                  >
                    {formatCommunityChatMessageTime(message.createdAt)}
                  </YeonText>
                </YeonView>
              </YeonView>
            );
          })}
        </YeonView>
      )}
    </YeonView>
  );
}
