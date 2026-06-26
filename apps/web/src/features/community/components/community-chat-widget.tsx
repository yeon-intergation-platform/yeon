"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  YeonButton,
  YeonIcon,
  YeonView,
  YeonText,
  type YeonInputElement,
  type YeonElement,
} from "@yeon/ui";
import { requestYeonAnimationFrame } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { canSendCommunityChatMessage } from "../community-post-format";
import { useCommunityChat } from "../hooks/use-community-chat";
import { useCommunityChatPanel } from "../hooks/use-community-chat-panel";
import { CommunityChatForm } from "./community-chat-form";
import { CommunityChatHeader } from "./community-chat-header";
import { CommunityChatMessageList } from "./community-chat-message-list";

type CommunityChatWidgetProps = {
  variant?: "full" | "compact" | "feed";
  className?: string;
  guestNickname?: string;
};

export function CommunityChatWidget({
  variant = "full",
  className,
  guestNickname,
}: CommunityChatWidgetProps) {
  const [messageBody, setMessageBody] = useState("");
  // 초기값은 닫힘(true). compact 패널의 실제 열림 여부는 useCommunityChatPanel이 결정한다
  // (데스크톱 기본 열림 / 모바일 닫힘 + 사용자 선택 저장소 유지).
  const [isBodyCollapsed, setIsBodyCollapsed] = useState(true);
  const [isShellCollapsed, setIsShellCollapsed] = useState(true);
  const messageInputRef = useRef<YeonInputElement | null>(null);
  const messageListRef = useRef<YeonElement | null>(null);
  const { isOpen: isChatPanelOpen, setOpen: setChatPanelOpen } =
    useCommunityChatPanel();

  const {
    messages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    sendMessage,
    activePresenceCount,
  } = useCommunityChat({
    pollIntervalMs: variant === "compact" ? 8000 : 5000,
    guestNickname,
  });

  const isCompact = variant === "compact";
  const isFeed = variant === "feed";
  const canSendMessage = canSendCommunityChatMessage({
    messageBody,
    isSendingMessage,
  });
  const shouldShowCollapsedShell = isShellCollapsed && isBodyCollapsed;
  const visibleMessages = useMemo(() => messages, [messages]);

  // compact 패널의 접힘/펼침 상태를 전역 열림 상태(isChatPanelOpen)에 동기화한다.
  // 라우트 이동/재마운트 후에도 store가 소스라 사용자 선택과 breakpoint 기본값이 유지된다.
  useEffect(() => {
    if (!isCompact) {
      return;
    }
    if (isChatPanelOpen) {
      setIsShellCollapsed(false);
      setIsBodyCollapsed(false);
      return;
    }
    setIsBodyCollapsed(true);
    setIsShellCollapsed(true);
  }, [isCompact, isChatPanelOpen]);

  useEffect(() => {
    const listElement = messageListRef.current;
    if (!listElement) {
      return;
    }

    listElement.scrollTop = listElement.scrollHeight;
  }, [visibleMessages]);

  const submitMessage = useCallback(() => {
    if (
      !canSendCommunityChatMessage({
        messageBody,
        isSendingMessage,
      })
    ) {
      return;
    }

    const trimmed = messageBody.trim();
    void sendMessage(trimmed)
      .then(() => {
        setMessageBody("");
        requestYeonAnimationFrame(() => {
          messageInputRef.current?.focus();
        });
      })
      .catch(() => {
        messageInputRef.current?.focus();
      });
  }, [isSendingMessage, messageBody, sendMessage]);

  const compactToggleButton = isCompact ? (
    <YeonButton
      type="button"
      variant="icon"
      size="icon"
      onClick={() => setChatPanelOpen(!isChatPanelOpen)}
      aria-label={shouldShowCollapsedShell ? "채팅 열기" : "채팅 접기"}
      aria-expanded={!isBodyCollapsed}
      className={[
        "absolute z-10 inline-flex items-center justify-center rounded-full bg-white text-[#666] transition-colors hover:text-[#111]",
        shouldShowCollapsedShell
          ? "right-0 top-0 h-14 w-14 border border-[#e5e5e5] hover:border-[#111]"
          : "right-3 top-3 h-9 w-9 border-0 shadow-none",
      ].join(" ")}
    >
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="inline-flex"
      >
        {shouldShowCollapsedShell ? (
          <YeonIcon name="message-circle" size={24} />
        ) : (
          <YeonIcon name="x" size={18} />
        )}
      </YeonText>
    </YeonButton>
  ) : null;

  return (
    <YeonView
      as="section"
      className={[
        isFeed
          ? "border-0 bg-white"
          : "rounded-2xl border border-[#e5e5e5] bg-white",
        isCompact
          ? shouldShowCollapsedShell
            ? "relative h-14 w-14 max-w-[calc(100vw-2rem)] overflow-hidden"
            : "relative w-[656px] max-w-[calc(100vw-2rem)] overflow-hidden"
          : "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isCompact ? compactToggleButton : null}

      {!isCompact ? (
        <CommunityChatHeader
          activePresenceCount={activePresenceCount}
          feed={isFeed}
        />
      ) : null}

      {!isCompact || !isBodyCollapsed ? (
        <YeonView
          className={[
            "space-y-2 overflow-hidden border-t border-[#e5e5e5] px-5 pb-4 pt-3 sm:px-6",
            isCompact
              ? "space-y-3 rounded-2xl border-t-0 pb-4 pt-4"
              : isFeed
                ? ""
                : "space-y-3 pb-4 pt-3",
          ].join(" ")}
        >
          {isCompact ? (
            <CommunityChatHeader
              activePresenceCount={activePresenceCount}
              compact
            />
          ) : null}

          <CommunityChatMessageList
            refObject={messageListRef}
            messages={visibleMessages}
            isLoading={isMessagesLoading}
            error={messageError}
            compact={isCompact}
            feed={isFeed}
          />

          <CommunityChatForm
            inputRef={messageInputRef}
            messageBody={messageBody}
            canSendMessage={canSendMessage}
            isSendingMessage={isSendingMessage}
            feed={isFeed}
            onChangeMessageBody={setMessageBody}
            onSubmitMessage={submitMessage}
          />
        </YeonView>
      ) : null}
    </YeonView>
  );
}
