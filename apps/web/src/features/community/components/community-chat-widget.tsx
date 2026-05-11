"use client";

import { useMemo, useState } from "react";

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    isSessionLoading,
    sessionError,
    sessionState,
    rooms,
    isRoomsLoading,
    roomError,
    selectedRoomId,
    setRoom,
    messages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    otpStep,
    otpPhoneNumber,
    otpDebugCode,
    otpRequestError,
    otpVerifyError,
    isRequestingOtp,
    isVerifyingOtp,
    requestOtp,
    verifyOtp,
    sendMessage,
    currentUser,
    reloadSession,
  } = useCommunityChat({
    pollIntervalMs: variant === "compact" ? 8000 : 5000,
  });

  const isCompact = variant === "compact";
  const currentMessageTarget = useMemo(() => {
    return rooms.find((room) => room.id === selectedRoomId) ?? null;
  }, [rooms, selectedRoomId]);

  const canSendMessage =
    sessionState.authenticated && !isMessagesLoading && Boolean(selectedRoomId);

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
          <h2 className="text-[16px] font-semibold text-[#111]">
            실시간 커뮤니티 채팅
          </h2>
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

      {(!isCompact || !isCollapsed) ? (
        <div className="border-t border-[#f0f0f0] px-4 pb-4 pt-3">
          {isSessionLoading ? (
            <p className="text-[13px] text-[#666]">채팅 상태 확인 중...</p>
          ) : null}

          {!sessionState.authenticated ? (
            <div className="space-y-3">
              <p className="text-[13px] text-[#666]">
                채팅은 채팅 서비스 계정 인증이 필요합니다.
              </p>

              {sessionError ? (
                <p className="text-[12px] text-red-600">{sessionError}</p>
              ) : null}

              {otpStep === "idle" ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void requestOtp(phoneNumber);
                  }}
                  className="space-y-2"
                >
                  <label
                    className="block text-[12px] text-[#666]"
                    htmlFor="chat-phone-input"
                  >
                    전화번호
                  </label>
                  <input
                    id="chat-phone-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="01012345678"
                    className="w-full rounded-xl border border-[#ddd] px-3 py-2 text-[14px] outline-none focus:border-[#111]"
                    disabled={isRequestingOtp}
                  />
                  {otpRequestError ? (
                    <p className="text-[12px] text-red-600">{otpRequestError}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isRequestingOtp}
                    className="w-full rounded-xl bg-[#111] py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#d0d0d0]"
                  >
                    {isRequestingOtp ? "인증번호 전송 중" : "인증번호 받기"}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void verifyOtp(otpCode);
                  }}
                  className="space-y-2"
                >
                  <div className="text-[12px] text-[#666]">
                    <p>{otpPhoneNumber}로 인증번호를 전송했습니다.</p>
                    {otpDebugCode ? (
                      <p className="mt-1 font-semibold text-[#333]">
                        임시 확인 코드: {otpDebugCode}
                      </p>
                    ) : null}
                  </div>
                  <label
                    className="block text-[12px] text-[#666]"
                    htmlFor="chat-otp-input"
                  >
                    인증코드
                  </label>
                  <input
                    id="chat-otp-input"
                    type="text"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    placeholder="6자리 코드"
                    className="w-full rounded-xl border border-[#ddd] px-3 py-2 text-[14px] outline-none focus:border-[#111]"
                    maxLength={32}
                    disabled={isVerifyingOtp}
                  />
                  {otpVerifyError ? (
                    <p className="text-[12px] text-red-600">{otpVerifyError}</p>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#111] py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#d0d0d0]"
                      disabled={isVerifyingOtp}
                    >
                      {isVerifyingOtp ? "인증 확인 중" : "인증 확인"}
                    </button>
                    <button
                      type="button"
                      onClick={() => reloadSession()}
                      className="rounded-xl border border-[#ddd] px-4 py-2 text-[12px] font-semibold text-[#333]"
                      aria-label="로그인 단계 다시 시작"
                    >
                      다시입력
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {isRoomsLoading ? <p className="text-[13px] text-[#666]">채팅방 목록 확인 중...</p> : null}
              {roomError ? <p className="text-[12px] text-red-600">{roomError}</p> : null}

              {rooms.length === 0 ? (
                <p className="text-[13px] text-[#666]">
                  현재 참여 중인 채팅방이 없습니다.
                  채팅 상대가 있어야 채팅방을 열 수 있어요.
                </p>
              ) : (
                <div className="space-y-2">
                  <label
                    className="block text-[12px] text-[#666]"
                    htmlFor="chat-room-select"
                  >
                    채팅방 선택
                  </label>
                  <select
                    id="chat-room-select"
                    className="w-full rounded-xl border border-[#ddd] px-3 py-2 text-[14px]"
                    value={selectedRoomId ?? ""}
                    onChange={(event) => setRoom(event.target.value || null)}
                  >
                    {rooms.map((room) => {
                      const peerName = room.peer.nickname;
                      return (
                        <option key={room.id} value={room.id}>
                          {peerName} · {room.unreadCount > 0 ? `${room.unreadCount}건` : "읽음"}
                        </option>
                      );
                    })}
                  </select>

                  {currentMessageTarget ? (
                    <p className="text-[12px] text-[#666]">
                      상대: {currentMessageTarget.peer.nickname}
                    </p>
                  ) : null}

                  <div
                    className={[
                      "rounded-xl border border-[#eee] bg-[#fafafa] p-3",
                      isCompact ? "h-[220px]" : "h-[320px]",
                      "overflow-y-auto",
                    ].join(" ")}
                  >
                    {isMessagesLoading ? (
                      <p className="text-[12px] text-[#777]">메시지를 불러오는 중...</p>
                    ) : null}

                    {messageError ? (
                      <p className="text-[12px] text-red-600">{messageError}</p>
                    ) : null}

                    {messages.length === 0 ? (
                      <p className="text-[12px] text-[#777]">아직 메시지가 없어요.</p>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((message) => {
                          const isMine = currentUser?.id === message.senderId;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isMine ? "justify-end" : "justify-start"
                              }`}
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
                                  {isMine ? "나" : "상대"}
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
                      maxLength={1000}
                      disabled={!canSendMessage || isSendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={!canSendMessage || isSendingMessage}
                      className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white disabled:bg-[#d0d0d0]"
                    >
                      전송
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
