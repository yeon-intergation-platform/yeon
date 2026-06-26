"use client";
import type { RefObject } from "react";
import {
  YeonButton,
  YeonField,
  YeonForm,
  type YeonInputElement,
} from "@yeon/ui";
import { COMMUNITY_CHAT_MESSAGE_MAX_LENGTH } from "../community-post-format";

type CommunityChatFormProps = {
  inputRef: RefObject<YeonInputElement | null>;
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
    <YeonForm
      onSubmit={(event) => {
        event.preventDefault();
        onSubmitMessage();
      }}
      className="grid grid-cols-[minmax(0,1fr)_58px] gap-2"
    >
      <YeonField
        ref={inputRef}
        value={messageBody}
        onChange={(event) => onChangeMessageBody(event.target.value)}
        placeholder={feed ? "실시간 채팅 입력" : "메시지 입력"}
        className="h-10 rounded-full px-4 text-[14px]"
        maxLength={COMMUNITY_CHAT_MESSAGE_MAX_LENGTH}
      />
      <YeonButton
        type="submit"
        variant="primary"
        size="sm"
        disabled={!canSendMessage}
        className="h-10 rounded-full px-4 text-[13px] font-bold"
      >
        {isSendingMessage ? "전송 중" : "전송"}
      </YeonButton>
    </YeonForm>
  );
}
