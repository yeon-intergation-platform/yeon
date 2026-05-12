"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

import { useCommunityChat } from "../hooks/use-community-chat";
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
  const [isBodyCollapsed, setIsBodyCollapsed] = useState(false);
  const [isShellCollapsed, setIsShellCollapsed] = useState(false);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

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
      onClick={() => {
        if (isBodyCollapsed || isShellCollapsed) {
          setIsShellCollapsed(false);
          setIsBodyCollapsed(false);
          return;
        }

        setIsBodyCollapsed(true);
      }}
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
