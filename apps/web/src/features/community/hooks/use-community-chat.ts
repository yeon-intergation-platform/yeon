"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { resolveCommunityGuestNickname } from "../community-guest-identity";
import {
  readPresenceSessionId,
  sendPresenceHeartbeat,
} from "../community-presence";
import {
  communityChatApi,
  type CommunityChatMessage,
} from "../community-chat-api";

type ErrorState = string | null;

type UseCommunityChatOptions = {
  pollIntervalMs?: number;
  guestNickname?: string;
};

export function useCommunityChat({
  pollIntervalMs = 6000,
  guestNickname,
}: UseCommunityChatOptions = {}) {
  const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [messageError, setMessageError] = useState<ErrorState>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activePresenceCount, setActivePresenceCount] = useState(1);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const loadMessages = useCallback(async () => {
    setMessageError(null);

    try {
      const response = await communityChatApi.listMessages();
      setMessages(response.messages);
    } catch (error) {
      if (error instanceof Error) {
        setMessageError(error.message);
      } else {
        setMessageError("채팅을 불러오지 못했습니다.");
      }
      setMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    const sessionId = readPresenceSessionId();
    let isDisposed = false;

    const updatePresence = async () => {
      try {
        const response = await sendPresenceHeartbeat(sessionId);
        if (!isDisposed && typeof response.activeCount === "number") {
          setActivePresenceCount(Math.max(1, response.activeCount));
        }
      } catch {
        if (!isDisposed) {
          setActivePresenceCount(1);
        }
      }
    };

    void updatePresence();
    const intervalId = window.setInterval(updatePresence, 10_000);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, pollIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [loadMessages, pollIntervalMs]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        setMessageError("메시지를 입력해주세요.");
        return;
      }

      const guestSessionId = readPresenceSessionId();
      setMessageError(null);
      setIsSendingMessage(true);

      try {
        const response = await communityChatApi.sendMessage({
          body: trimmed,
          guestSessionId,
          guestNickname: resolveCommunityGuestNickname(guestNickname),
        });
        setMessages((current) => [...current, response.message]);
        await loadMessages();
      } catch (error) {
        if (error instanceof Error) {
          setMessageError(error.message);
        } else {
          setMessageError("메시지를 전송하지 못했습니다.");
        }
        throw error;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [guestNickname, loadMessages]
  );

  return {
    messages: sortedMessages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    sendMessage,
    activePresenceCount,
  };
}

export type UseCommunityChatReturn = ReturnType<typeof useCommunityChat>;
