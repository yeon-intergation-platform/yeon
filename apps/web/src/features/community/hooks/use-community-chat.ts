"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  readPresenceSessionId,
  sendPresenceHeartbeat,
} from "../community-presence";
import { chatServiceApi, type ChatServiceFeedPost } from "../chat-service-api";

type ErrorState = string | null;

type UseCommunityChatOptions = {
  pollIntervalMs?: number;
};

type CommunityChatGuest = {
  guestNickname: string;
  guestPassword: string;
};

const COMMUNITY_CHAT_GUEST_STORAGE_KEY = "yeon-community-chat-guest";

function createFallbackRandomId() {
  return Math.random().toString(36).slice(2, 10);
}

function createCommunityChatGuest(): CommunityChatGuest {
  const randomId =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : createFallbackRandomId();

  return {
    guestNickname: "익명이",
    guestPassword: `guest-${randomId}-${Date.now()}`,
  };
}

function readCommunityChatGuest(): CommunityChatGuest {
  if (typeof window === "undefined") {
    return createCommunityChatGuest();
  }

  const raw = window.localStorage.getItem(COMMUNITY_CHAT_GUEST_STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<CommunityChatGuest>;
      if (parsed.guestNickname?.trim() && parsed.guestPassword?.trim()) {
        return {
          guestNickname: parsed.guestNickname.trim(),
          guestPassword: parsed.guestPassword.trim(),
        };
      }
    } catch {
      window.localStorage.removeItem(COMMUNITY_CHAT_GUEST_STORAGE_KEY);
    }
  }

  const created = createCommunityChatGuest();
  window.localStorage.setItem(
    COMMUNITY_CHAT_GUEST_STORAGE_KEY,
    JSON.stringify(created)
  );

  return created;
}

export function useCommunityChat({
  pollIntervalMs = 6000,
}: UseCommunityChatOptions = {}) {
  const [guest, setGuest] = useState<CommunityChatGuest | null>(null);
  const [messages, setMessages] = useState<ChatServiceFeedPost[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [messageError, setMessageError] = useState<ErrorState>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activePresenceCount, setActivePresenceCount] = useState(1);

  const currentGuestNickname = guest?.guestNickname ?? null;

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const loadMessages = useCallback(async () => {
    setMessageError(null);

    try {
      const response = await chatServiceApi.listFeedPosts();
      setMessages(response.posts);
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
    setGuest(readCommunityChatGuest());
    void loadMessages();
  }, [loadMessages]);

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
    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, pollIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [loadMessages, pollIntervalMs]);

  const setGuestNickname = useCallback(
    (nickname: string) => {
      const trimmedNickname = nickname.trim();
      const previous = guest ?? readCommunityChatGuest();
      const next = {
        ...previous,
        guestNickname: trimmedNickname || previous.guestNickname,
      };

      setGuest(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          COMMUNITY_CHAT_GUEST_STORAGE_KEY,
          JSON.stringify(next)
        );
      }
    },
    [guest]
  );

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        setMessageError("메시지를 입력해주세요.");
        return;
      }

      const actor = guest ?? readCommunityChatGuest();
      if (!guest) {
        setGuest(actor);
      }

      setMessageError(null);
      setIsSendingMessage(true);

      try {
        await chatServiceApi.createFeedPost(trimmed, actor);
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
    [guest, loadMessages]
  );

  return {
    messages: sortedMessages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    sendMessage,
    currentGuestNickname,
    setGuestNickname,
    activePresenceCount,
  };
}

export type UseCommunityChatReturn = ReturnType<typeof useCommunityChat>;
