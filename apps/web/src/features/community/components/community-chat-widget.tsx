"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

export function CommunityChatWidget({
  variant = "full",
  className,
}: CommunityChatWidgetProps) {
  const [messageBody, setMessageBody] = useState("");
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  const {
    messages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    sendMessage,
    currentGuestNickname,
    setGuestNickname,
    activePresenceCount,
  } = useCommunityChat({
    pollIntervalMs: variant === "compact" ? 8000 : 5000,
  });

  useEffect(() => {
    if (currentGuestNickname) {
      setNicknameDraft(currentGuestNickname);
    }
  }, [currentGuestNickname]);

  const isCompact = variant === "compact";
  const isFeed = variant === "feed";
  const canSendMessage = !isSendingMessage;
  const visibleMessages = isFeed ? messages.slice(-3) : messages;
  const showNicknameInput = !isFeed;
  const compactToggleButton = isCompact ? (
    <button
      type="button"
      onClick={() => setIsCollapsed((value) => !value)}
      aria-label={isCollapsed ? "채팅 열기" : "채팅 접기"}
      aria-expanded={!isCollapsed}
      className={[
        "inline-flex items-center justify-center rounded-full bg-white text-[#555] shadow-[0_8px_24px_rgba(17,19,24,0.14)] transition-colors hover:text-[#111]",
        isCollapsed
          ? "h-14 w-14 border border-[#e5e5e5] hover:border-[#111]"
          : "absolute right-3 top-3 z-10 h-9 w-9 border-0 shadow-none",
      ].join(" ")}
    >
      {isCollapsed ? <MessageCircle size={24} /> : <X size={18} />}
    </button>
  ) : null;

  return (
    <section
      className={[
        "rounded-2xl border border-[#e5e5e5] bg-white",
        isCompact
          ? isCollapsed
            ? "w-fit border-0 bg-transparent shadow-none"
            : "relative w-[656px] max-w-[calc(100vw-2rem)] shadow-[0_8px_30px_rgba(17,19,24,0.12)]"
          : "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isCompact ? compactToggleButton : null}

      {!isCompact ? (
        <div className={isFeed ? "px-4 py-2.5" : "px-4 py-3"}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="whitespace-nowrap text-[15px] font-semibold text-[#111]">
                실시간 채팅
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#999]">
                {messages.length}개
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {!isCompact || !isCollapsed ? (
          <motion.div
            key="chat-widget-body"
            initial={isCompact ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={isCompact ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={[
              "space-y-2 overflow-hidden border-t border-[#f0f0f0] px-4 pb-3 pt-2.5",
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
              className={[
                "rounded-xl border border-[#eee] bg-[#fafafa] p-2.5",
                isCompact ? "h-[220px]" : isFeed ? "h-[96px]" : "h-[360px]",
                "overflow-y-auto",
              ].join(" ")}
            >
              {isMessagesLoading ? (
                <p className="text-[12px] text-[#777]">채팅을 불러오는 중...</p>
              ) : null}

              {messageError ? (
                <p className="text-[12px] text-red-600">{messageError}</p>
              ) : null}

              {!isMessagesLoading && visibleMessages.length === 0 ? null : (
                <div className="space-y-1.5">
                  {visibleMessages.map((message) => {
                    const isMine =
                      currentGuestNickname !== null &&
                      message.author.nickname === currentGuestNickname;

                    return (
                      <div
                        key={message.id}
                        className="grid grid-cols-[72px_42px_minmax(0,1fr)] items-baseline gap-2 text-[12px] leading-[1.45]"
                      >
                        <span className="truncate font-semibold text-[#555]">
                          {isMine ? "나" : message.author.nickname}
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

                setGuestNickname(nicknameDraft);
                void sendMessage(trimmed).then(() => {
                  setMessageBody("");
                  window.requestAnimationFrame(() => {
                    messageInputRef.current?.focus();
                  });
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
                  value={nicknameDraft}
                  onChange={(event) => setNicknameDraft(event.target.value)}
                  placeholder="닉네임"
                  className="h-9 rounded-xl border border-[#ddd] px-3 text-[13px] outline-none focus:border-[#111]"
                  maxLength={40}
                  disabled={!canSendMessage}
                />
              ) : null}
              <input
                ref={messageInputRef}
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="메시지 입력"
                className="h-9 rounded-xl border border-[#ddd] px-3 text-[13px] outline-none focus:border-[#111]"
                maxLength={400}
              />
              <button
                type="submit"
                disabled={!canSendMessage || !messageBody.trim()}
                className="h-9 rounded-xl bg-[#111] px-3 text-[12px] font-semibold text-white disabled:bg-[#d0d0d0]"
              >
                {isSendingMessage ? "전송" : "전송"}
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
