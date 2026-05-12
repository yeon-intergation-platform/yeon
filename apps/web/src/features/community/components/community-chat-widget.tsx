"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

import { useCommunityChat } from "../hooks/use-community-chat";

type CommunityChatWidgetProps = {
  variant?: "full" | "compact" | "feed";
  className?: string;
};

function formatMessageTime(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate));
}

function trimDisplayText(value: string) {
  return value.trim();
}

const COMPACT_CHAT_EXPANDED_WIDTH = 656;
const COMPACT_CHAT_COLLAPSED_SIZE = 56;

export function CommunityChatWidget({
  variant = "full",
  className,
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
    currentUserId,
    activePresenceCount,
  } = useCommunityChat({
    pollIntervalMs: variant === "compact" ? 8000 : 5000,
  });

  const isCompact = variant === "compact";
  const isFeed = variant === "feed";
  const canSendMessage = !isSendingMessage;
  const shouldShowCollapsedShell = isShellCollapsed && isBodyCollapsed;
  const visibleMessages = useMemo(() => messages, [messages]);
  const showNicknameInput = false;
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
        <div className={isFeed ? "px-5 py-3 sm:px-6" : "px-4 py-3"}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="whitespace-nowrap text-[16px] font-black tracking-[-0.02em] text-[#0f1419]">
                실시간 채팅
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#999]">
                접속 {activePresenceCount}명
              </span>
            </div>
          </div>
        </div>
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
              <div className="flex items-center justify-between gap-3 pr-10">
                <h2 className="text-[15px] font-semibold text-[#111]">
                  실시간 채팅
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#777]"
                  aria-label={`현재 접속 ${activePresenceCount}명`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{activePresenceCount}</span>
                </span>
              </div>
            ) : null}

            <div
              ref={messageListRef}
              className={[
                isFeed
                  ? "border-y border-[#eff3f4] bg-white py-3"
                  : "rounded-xl border border-[#eee] bg-[#fafafa] p-2.5",
                isCompact ? "h-[240px]" : isFeed ? "h-[280px]" : "h-[420px]",
                "overflow-y-auto overscroll-contain",
              ].join(" ")}
            >
              {isMessagesLoading ? (
                <p className="text-[12px] text-[#777]">채팅을 불러오는 중...</p>
              ) : null}

              {messageError ? (
                <p className="text-[12px] text-red-600">{messageError}</p>
              ) : null}

              {!isMessagesLoading && visibleMessages.length === 0 ? (
                <p className="px-1 py-8 text-center text-[13px] font-semibold text-[#777]">
                  아직 채팅이 없습니다. 첫 메시지를 남겨보세요.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {visibleMessages.map((message) => {
                    const isMine =
                      currentUserId !== null &&
                      message.senderId === currentUserId;
                    const senderName = isMine ? "나" : message.senderNickname;

                    return (
                      <div
                        key={message.id}
                        className="grid grid-cols-[78px_48px_minmax(0,1fr)] items-baseline gap-2 text-[13px] leading-[1.55]"
                      >
                        <span className="truncate font-semibold text-[#555]">
                          {senderName}
                        </span>
                        <span className="font-mono text-[10px] text-[#999]">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        <span className="truncate text-[#111]">
                          {trimDisplayText(message.body)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
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
              }}
              className={[
                "grid gap-2",
                showNicknameInput
                  ? "grid-cols-[112px_minmax(0,1fr)_58px]"
                  : "grid-cols-[minmax(0,1fr)_58px]",
              ].join(" ")}
            >
              {showNicknameInput ? (
                <input
                  value=""
                  onChange={() => {}}
                  placeholder="닉네임"
                  className="h-9 rounded-xl border border-[#ddd] px-3 text-[13px] outline-none focus:border-[#111]"
                  maxLength={40}
                  disabled
                />
              ) : null}
              <input
                ref={messageInputRef}
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder={isFeed ? "실시간 채팅 입력" : "메시지 입력"}
                className="h-10 rounded-full border border-[#cfd9de] px-4 text-[14px] outline-none focus:border-[#1d9bf0]"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!canSendMessage || !messageBody.trim()}
                className="h-10 rounded-full bg-[#0f1419] px-4 text-[13px] font-bold text-white disabled:bg-[#cfd9de]"
              >
                {isSendingMessage ? "전송" : "전송"}
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
