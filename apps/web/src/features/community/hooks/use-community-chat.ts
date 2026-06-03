"use client";
import { useCallback, useMemo } from "react";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import { resolveCommunityGuestNickname } from "../community-guest-identity";
import {
  readPresenceSessionId,
  sendPresenceHeartbeat,
} from "../community-presence";
import {
  communityChatApi,
  type CommunityChatMessage,
} from "../community-chat-api";
import { communityQueryKeys } from "./community-query-keys";

type UseCommunityChatOptions = {
  pollIntervalMs?: number;
  guestNickname?: string;
};

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function useCommunityChat({
  pollIntervalMs = 6000,
  guestNickname,
}: UseCommunityChatOptions = {}) {
  const queryClient = useQueryClient();
  const presenceSessionId = useMemo(() => readPresenceSessionId(), []);

  const messagesQuery = useQuery({
    queryKey: communityQueryKeys.chatMessages(),
    queryFn: async () => communityChatApi.listMessages(),
    refetchInterval: pollIntervalMs,
  });

  const presenceQuery = useQuery({
    queryKey: communityQueryKeys.presenceHeartbeat(presenceSessionId),
    queryFn: async () => sendPresenceHeartbeat(presenceSessionId),
    refetchInterval: 10_000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        throw new Error("메시지를 입력해주세요.");
      }

      return communityChatApi.sendMessage({
        body: trimmed,
        guestSessionId: presenceSessionId,
        guestNickname: resolveCommunityGuestNickname(guestNickname),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.chatMessages(),
      });
    },
  });

  const messages = useMemo(() => {
    const currentMessages: CommunityChatMessage[] = messagesQuery.data
      ? messagesQuery.data.messages
      : [];

    return [...currentMessages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messagesQuery.data?.messages]);

  const sendMessage = useCallback(
    async (message: string) => {
      await sendMessageMutation.mutateAsync(message);
    },
    [sendMessageMutation]
  );

  const messageError =
    sendMessageMutation.error !== null
      ? getErrorMessage(
          sendMessageMutation.error,
          "메시지를 전송하지 못했습니다."
        )
      : messagesQuery.error !== null
        ? getErrorMessage(messagesQuery.error, "채팅을 불러오지 못했습니다.")
        : null;

  return {
    messages,
    isMessagesLoading: messagesQuery.isLoading,
    messageError,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessage,
    activePresenceCount: Math.max(1, presenceQuery.data?.activeCount ?? 1),
  };
}

export type UseCommunityChatReturn = ReturnType<typeof useCommunityChat>;
