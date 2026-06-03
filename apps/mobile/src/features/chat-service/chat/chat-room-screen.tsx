import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import {
  useYeonLocalSearchParams as useLocalSearchParams,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import type { ChatServiceChatMessageDto } from "@yeon/api-contract/chat-service";
import { useCallback, useMemo, useState } from "react";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonChatComposer as ChatComposer,
  YeonChatMessageBubble as ChatMessageBubble,
  YeonChatRoomHeader as ChatRoomHeader,
  YeonChatRoomInset as ChatRoomInset,
  YeonFlatList as FlatList,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
  YeonTextField as TextField,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { formatRelativeTime, parseOptionalString } from "../../../lib/format";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";
import { chatServiceApi } from "../../../services/chat-service/client";
import { chatServiceQueryKeys } from "../../../services/chat-service/query-keys";

export function ChatRoomScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { roomId: rawRoomId } = useLocalSearchParams();
  const roomId = parseOptionalString(rawRoomId) ?? "";
  const { session, status } = useChatServiceSession();
  const isSignedIn = status === "signed_in";
  const sessionToken = session?.token ?? "";
  const [draft, setDraft] = useState("");

  const roomQuery = useQuery({
    enabled: isSignedIn && Boolean(roomId),
    queryFn: async () => {
      return chatServiceApi.getChatServiceRoom(sessionToken, roomId);
    },
    queryKey: chatServiceQueryKeys.room(roomId),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.sendChatServiceMessage(sessionToken, roomId, {
        body: draft.trim(),
      });
    },
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.room(roomId),
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.rooms,
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return chatServiceApi.blockChatServiceProfile(sessionToken, profileId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.rooms,
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return chatServiceApi.createChatServiceReport(sessionToken, {
        reason: "채팅 메시지 신고",
        targetId: messageId,
        targetType: "chat_message",
      });
    },
  });

  async function handleSend() {
    try {
      await sendMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "메시지 전송에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleBlockPeer() {
    if (!roomQuery.data) {
      return;
    }

    try {
      await blockMutation.mutateAsync(roomQuery.data.room.peer.id);
      showYeonAlert("차단 완료", "이제 이 상대와의 대화가 차단됩니다.");
      router.replace("/(tabs)/chat");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "차단 처리에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  const handleReportMessage = useCallback(
    async (messageId: string) => {
      try {
        await reportMutation.mutateAsync(messageId);
        showYeonAlert("신고 접수", "메시지 신고가 접수됐습니다.");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "메시지 신고에 실패했습니다.";
        showYeonAlert("오류", message);
      }
    },
    [reportMutation]
  );

  const currentUserId = session?.user.id;

  // inverted FlatList는 시각적 하단(최신)이 데이터 0번이므로 역순 배열을 만든다.
  const invertedMessages = useMemo(
    () => (roomQuery.data ? [...roomQuery.data.messages].reverse() : []),
    [roomQuery.data]
  );

  const keyExtractor = useCallback(
    (message: ChatServiceChatMessageDto) => message.id,
    []
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatServiceChatMessageDto }) => {
      const mine = item.senderId === currentUserId;
      return (
        <ChatMessageBubble
          body={item.body}
          meta={formatRelativeTime(item.createdAt)}
          mine={mine}
          onReportPress={
            mine ? undefined : () => void handleReportMessage(item.id)
          }
        />
      );
    },
    [currentUserId, handleReportMessage]
  );

  return (
    <MobileScreen contentVariant="full" keyboardAvoiding scroll={false}>
      <ChatRoomHeader
        topBar={
          <TopBar
            rightLabel="목록"
            onRightPress={() => router.replace("/(tabs)/chat")}
            subtitle={roomQuery.data?.room.peer.nickname ?? "대화"}
            title="대화방"
          />
        }
        actionsSlot={
          roomQuery.data ? (
            <>
              <ActionButton
                label="프로필"
                onPress={() =>
                  router.push(`/profile/${roomQuery.data.room.peer.id}`)
                }
                variant="secondary"
              />
              <ActionButton
                label="차단"
                onPress={() => {
                  showYeonAlert(
                    "이 사용자를 차단할까요?",
                    "친구 요청과 추가 대화 열기가 모두 막힙니다.",
                    [
                      {
                        style: "cancel",
                        text: "취소",
                      },
                      {
                        onPress: () => {
                          void handleBlockPeer();
                        },
                        style: "destructive",
                        text: "차단",
                      },
                    ]
                  );
                }}
                variant="danger"
              />
            </>
          ) : null
        }
      />

      {roomQuery.isLoading ? (
        <ChatRoomInset>
          <StateBlock
            loading
            message="대화 내용을 불러오는 중입니다."
            title="대화 준비 중"
          />
        </ChatRoomInset>
      ) : null}

      {roomQuery.isError ? (
        <ChatRoomInset>
          <StateBlock
            message="대화 내용을 불러오지 못했습니다."
            title="대화 로드 실패"
          />
        </ChatRoomInset>
      ) : null}

      {roomQuery.data ? (
        <>
          <FlatList
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 24,
              paddingHorizontal: 18,
              paddingTop: 18,
            }}
            data={invertedMessages}
            inverted
            keyExtractor={keyExtractor}
            renderItem={renderMessage}
            style={{ flex: 1 }}
          />

          <ChatComposer>
            <TextField
              label="메시지"
              multiline
              onChangeText={setDraft}
              placeholder="대화를 입력해 주세요"
              value={draft}
            />
            <ActionButton
              disabled={sendMutation.isPending || draft.trim().length < 1}
              label="보내기"
              onPress={handleSend}
            />
          </ChatComposer>
        </>
      ) : null}
    </MobileScreen>
  );
}
