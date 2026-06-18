"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YeonText, YeonView } from "@yeon/ui";
import { COMMUNITY_CHAT_RETENTION_DAYS } from "./community-chat-format";

type CommunityChatHeaderProps = {
  activePresenceCount: number;
  compact?: boolean;
  feed?: boolean;
};

export function CommunityChatHeader({
  activePresenceCount,
  compact = false,
  feed = false,
}: CommunityChatHeaderProps) {
  if (compact) {
    return (
      <YeonView className="flex items-start justify-between gap-3 pr-10">
        <YeonView>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[15px] font-semibold text-[#111]"
          >
            실시간 채팅
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-0.5 text-[11px] font-semibold text-[#888]"
          >
            채팅은 {COMMUNITY_CHAT_RETENTION_DAYS}일 뒤 사라져요.
          </YeonText>
        </YeonView>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={`inline-flex items-center gap-1.5 ${SHARED_FEATURE_CLASS.text12EmphasisSubtle}`}
          aria-label={`현재 접속 ${activePresenceCount}명`}
        >
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="h-2 w-2 rounded-full bg-[#111]"
            aria-hidden="true"
          />
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            aria-hidden="true"
          >
            접속 {activePresenceCount}명
          </YeonText>
        </YeonText>
      </YeonView>
    );
  }

  return (
    <YeonView className={feed ? "px-5 py-3 sm:px-6" : "px-4 py-3"}>
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="whitespace-nowrap text-[16px] font-black tracking-[-0.02em] text-[#111]"
          >
            실시간 채팅
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-1 text-[12px] font-semibold text-[#888]"
          >
            채팅은 {COMMUNITY_CHAT_RETENTION_DAYS}일 뒤 사라져요.
          </YeonText>
        </YeonView>
        <YeonView
          className="flex items-center gap-2 text-[14px] font-bold text-[#666]"
          aria-label={`현재 접속 ${activePresenceCount}명`}
        >
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="h-2.5 w-2.5 rounded-full bg-[#111]"
            aria-hidden="true"
          />
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            aria-hidden="true"
          >
            접속 {activePresenceCount}명
          </YeonText>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
