"use client";

import type { RefObject } from "react";

type CommunityChatFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  messageBody: string;
  canSendMessage: boolean;
  isSendingMessage: boolean;
  feed: boolean;
  onChangeMessageBody: (value: string) => void;
  onSubmitMessage: () => void;
};

export function CommunityChatForm({
  inputRef,
  messageBody,
  canSendMessage,
  isSendingMessage,
  feed,
  onChangeMessageBody,
  onSubmitMessage,
}: CommunityChatFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmitMessage();
      }}
      className="grid grid-cols-[minmax(0,1fr)_58px] gap-2"
    >
      <input
        ref={inputRef}
        value={messageBody}
        onChange={(event) => onChangeMessageBody(event.target.value)}
        placeholder={feed ? "실시간 채팅 입력" : "메시지 입력"}
        className="h-10 rounded-full border border-[#cfd9de] px-4 text-[14px] outline-none focus:border-[#1d9bf0]"
        maxLength={1000}
      />
      <button
        type="submit"
        disabled={!canSendMessage || !messageBody.trim()}
        className="h-10 rounded-full bg-[#0f1419] px-4 text-[13px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#e5e5e5] disabled:text-[#aaa]"
      >
        {isSendingMessage ? "전송 중" : "전송"}
      </button>
    </form>
  );
}
