"use client";

import { useState } from "react";

import { useCommunityChat } from "../hooks/use-community-chat";

type CommunityChatWidgetProps = {
  variant?: "full" | "compact";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    messages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    sendMessage,
    currentGuestNickname,
  } = useCommunityChat({
    pollIntervalMs: variant === "compact" ? 8000 : 5000,
  });

  const isCompact = variant === "compact";
  const canSendMessage = !isSendingMessage;

  return (
    <section
      className={[
        "rounded-2xl border border-[#e5e5e5] bg-white",
        isCompact
          ? "w-[328px] max-w-[calc(100%-1rem)] shadow-[0_8px_30px_rgba(17,19,24,0.12)]"
          : "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111]">
              실시간 커뮤니티 채팅
            </h2>
            <p className="mt-1 text-[12px] text-[#777]">
              로그인이나 전화번호 인증 없이 바로 대화할 수 있어요.
            </p>
          </div>
          {isCompact ? (
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              className="rounded-lg border border-[#e5e5e5] px-2 py-1 text-[11px] font-semibold text-[#333]"
            >
              {isCollapsed ? "열기" : "접기"}
            </button>
          ) : null}
        </div>
      </div>

      {isCompact && isCollapsed ? (
        <div className="px-4 pb-3 text-[12px] text-[#555]">
          채팅 위젯이 접혔습니다.
        </div>
      ) : null}

      {!isCompact || !isCollapsed ? (
        <div className="space-y-3 border-t border-[#f0f0f0] px-4 pb-4 pt-3">
          <div
            className={[
              "rounded-xl border border-[#eee] bg-[#fafafa] p-3",
              isCompact ? "h-[220px]" : "h-[360px]",
              "overflow-y-auto",
            ].join(" ")}
          >
            {isMessagesLoading ? (
              <p className="text-[12px] text-[#777]">채팅을 불러오는 중...</p>
            ) : null}

            {messageError ? (
              <p className="text-[12px] text-red-600">{messageError}</p>
            ) : null}

            {!isMessagesLoading && messages.length === 0 ? (
              <p className="text-[12px] text-[#777]">아직 메시지가 없어요.</p>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => {
                  const isMine =
                    currentGuestNickname !== null &&
                    message.author.nickname === currentGuestNickname;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-xl px-3 py-2",
                          isMine
                            ? "bg-[#111] text-white"
                            : "bg-[#efefef] text-[#111]",
                        ].join(" ")}
                      >
                        <p className="text-[12px] font-semibold">
                          {isMine ? "나" : message.author.nickname}
                        </p>
                        <p className="mt-1 text-[13px] leading-[1.45]">
                          {trimDisplayText(message.body)}
                        </p>
                        <p
                          className={
                            isMine
                              ? "mt-1 text-[10px] text-[#ddd]"
                              : "mt-1 text-[10px] text-[#666]"
                          }
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
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

              void sendMessage(trimmed).then(() => {
                setMessageBody("");
              });
            }}
            className="flex gap-2"
          >
            <input
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder="메시지를 입력하세요"
              className="flex-1 rounded-xl border border-[#ddd] px-3 py-2 text-[14px] outline-none focus:border-[#111]"
              maxLength={400}
              disabled={!canSendMessage}
            />
            <button
              type="submit"
              disabled={!canSendMessage || !messageBody.trim()}
              className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white disabled:bg-[#d0d0d0]"
            >
              {isSendingMessage ? "전송 중" : "전송"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
