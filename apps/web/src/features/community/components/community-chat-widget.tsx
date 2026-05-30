"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

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

const COMPACT_CHAT_EXPANDED_WIDTH = 656;
const COMPACT_CHAT_COLLAPSED_SIZE = 56;

export function CommunityChatWidget({
  variant = "full",
  className,
  guestNickname,
}: CommunityChatWidgetProps) {
  const [messageBody, setMessageBody] = useState("");
  // 초기값은 닫힘(true). compact 패널의 실제 열림 여부는 useCommunityChatPanel이 결정한다
  // (데스크톱 기본 열림 / 모바일 닫힘 + 사용자 선택 localStorage 유지).
  const [isBodyCollapsed, setIsBodyCollapsed] = useState(true);
  const [isShellCollapsed, setIsShellCollapsed] = useState(true);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
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
  const canSendMessage = !isSendingMessage;
  const shouldShowCollapsedShell = isShellCollapsed && isBodyCollapsed;
  const visibleMessages = useMemo(() => messages, [messages]);
  const compactContainerMotion = isCompact
    ? {
        initial: false,
        animate: shouldReduceMotion
          ? undefined
          : shouldShowCollapsedShell
            ? {
                width: COMPACT_CHAT_COLLAPSED_SIZE,
                height: COMPACT_CHAT_COLLAPSED_SIZE,
                borderRadius: COMPACT_CHAT_COLLAPSED_SIZE / 2,
                boxShadow: "0 8px 24px rgba(17,19,24,0.14)",
              }
            : {
                width: COMPACT_CHAT_EXPANDED_WIDTH,
                height: "auto",
                borderRadius: 16,
                boxShadow: "0 8px 30px rgba(17,19,24,0.12)",
              },
        transition: shouldReduceMotion
          ? { duration: 0 }
          : {
              width: { type: "spring", stiffness: 420, damping: 36 },
              height: { duration: 0.22, ease: "easeOut" },
              borderRadius: { duration: 0.2, ease: "easeOut" },
              boxShadow: { duration: 0.18, ease: "easeOut" },
            },
      }
    : {};

  // compact 패널의 접힘/펼침 애니메이션 상태를 전역 열림 상태(isChatPanelOpen)에 동기화한다.
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
    // 닫힘: 본문을 접으면 exit 애니메이션 후 onExitComplete가 shell을 원형으로 접는다.
    setIsBodyCollapsed(true);
  }, [isCompact, isChatPanelOpen]);

  useEffect(() => {
    const listElement = messageListRef.current;
    if (!listElement) {
      return;
    }

    listElement.scrollTop = listElement.scrollHeight;
  }, [visibleMessages]);

  const submitMessage = useCallback(() => {
    const trimmed = messageBody.trim();
    if (!trimmed) {
      return;
    }

    void sendMessage(trimmed)
      .then(() => {
        setMessageBody("");
        window.requestAnimationFrame(() => {
          messageInputRef.current?.focus();
        });
      })
      .catch(() => {
        messageInputRef.current?.focus();
      });
  }, [messageBody, sendMessage]);

  const compactToggleButton = isCompact ? (
    <motion.button
      type="button"
      onClick={() => setChatPanelOpen(!isChatPanelOpen)}
      aria-label={shouldShowCollapsedShell ? "채팅 열기" : "채팅 접기"}
      aria-expanded={!isBodyCollapsed}
      initial={false}
      animate={
        shouldReduceMotion
          ? undefined
          : shouldShowCollapsedShell
            ? {
                width: COMPACT_CHAT_COLLAPSED_SIZE,
                height: COMPACT_CHAT_COLLAPSED_SIZE,
                top: 0,
                right: 0,
              }
            : { width: 36, height: 36, top: 12, right: 12 }
      }
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className={[
        "absolute z-10 inline-flex items-center justify-center rounded-full bg-white text-[#555] transition-colors hover:text-[#111]",
        shouldShowCollapsedShell
          ? "right-0 top-0 h-14 w-14 border border-[#e5e5e5] hover:border-[#111]"
          : "right-3 top-3 h-9 w-9 border-0 shadow-none",
      ].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={shouldShowCollapsedShell ? "chat-open-icon" : "chat-close-icon"}
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, rotate: -12, scale: 0.85 }
          }
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={
            shouldReduceMotion
              ? undefined
              : { opacity: 0, rotate: 12, scale: 0.85 }
          }
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="inline-flex"
        >
          {shouldShowCollapsedShell ? (
            <MessageCircle size={24} />
          ) : (
            <X size={18} />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  ) : null;

  return (
    <motion.section
      {...compactContainerMotion}
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

      <AnimatePresence
        initial={false}
        onExitComplete={() => {
          if (isCompact && isBodyCollapsed) {
            setIsShellCollapsed(true);
          }
        }}
      >
        {!isCompact || !isBodyCollapsed ? (
          <motion.div
            key="chat-widget-body"
            initial={
              isCompact && !shouldReduceMotion
                ? { opacity: 0, height: 0, filter: "blur(2px)" }
                : false
            }
            animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
            exit={
              isCompact && !shouldReduceMotion
                ? {
                    opacity: 0,
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    filter: "blur(2px)",
                  }
                : undefined
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.18,
              ease: "easeOut",
            }}
            className={[
              "space-y-2 overflow-hidden border-t border-[#eff3f4] px-5 pb-4 pt-3 sm:px-6",
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
