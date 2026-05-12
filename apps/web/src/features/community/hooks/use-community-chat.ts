"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  readPresenceSessionId,
  sendPresenceHeartbeat,
} from "../community-presence";
import {
  chatServiceApi,
  type ChatServiceMessage,
  type ChatServiceRoom,
} from "../chat-service-api";

type ErrorState = string | null;

type UseCommunityChatOptions = {
  pollIntervalMs?: number;
};

export function useCommunityChat({
  pollIntervalMs = 6000,
}: UseCommunityChatOptions = {}) {
  const [messages, setMessages] = useState<ChatServiceMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatServiceRoom | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
      const sessionResponse = await chatServiceApi.getSession();
      const userId = sessionResponse.session?.user.id ?? null;
      setCurrentUserId(userId);

      if (!sessionResponse.authenticated || !userId) {
        setActiveRoom(null);
        setMessages([]);
        setMessageError("채팅은 채팅 서비스 로그인 후 사용할 수 있습니다.");
        return;
      }

      const roomsResponse = await chatServiceApi.listRooms();
      const selectedRoom = roomsResponse.rooms[0] ?? null;
      setActiveRoom(selectedRoom);

      if (!selectedRoom) {
        setMessages([]);
        setMessageError("열린 채팅방이 없습니다. 친구 채팅방을 만든 뒤 이용해주세요.");
        return;
      }

      const roomResponse = await chatServiceApi.getRoom(selectedRoom.id);
      setMessages(roomResponse.messages);
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


  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        setMessageError("메시지를 입력해주세요.");
        return;
      }

      if (!activeRoom) {
        setMessageError("전송할 채팅방이 없습니다. 채팅방을 만든 뒤 이용해주세요.");
        throw new Error("전송할 채팅방이 없습니다.");
      }

      setMessageError(null);
      setIsSendingMessage(true);

      try {
        const response = await chatServiceApi.sendMessage(activeRoom.id, trimmed);
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
    [activeRoom, loadMessages]
  );

  return {
    messages: sortedMessages,
    isMessagesLoading,
    messageError,
    isSendingMessage,
    sendMessage,
    currentUserId,
    activeRoomPeerNickname: activeRoom?.peer.nickname ?? null,
    activePresenceCount,
  };
}

export type UseCommunityChatReturn = ReturnType<typeof useCommunityChat>;
