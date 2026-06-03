import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import {
  useYeonLocalSearchParams as useLocalSearchParams,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { useRef, useState } from "react";
import { type YeonScrollViewHandle, showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonChatComposer as ChatComposer,
  YeonChatMessageBubble as ChatMessageBubble,
  YeonChatMessageScroll as ChatMessageScroll,
  YeonChatRoomHeader as ChatRoomHeader,
  YeonChatRoomInset as ChatRoomInset,
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
  const scrollRef = useRef<YeonScrollViewHandle | null>(null);
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

  async function handleReportMessage(messageId: string) {
    try {
      await reportMutation.mutateAsync(messageId);
      showYeonAlert("신고 접수", "메시지 신고가 접수됐습니다.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "메시지 신고에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

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
          <ChatMessageScroll
            onContentSizeChange={() => {
              scrollRef.current?.scrollToEnd({ animated: false });
            }}
            ref={scrollRef}
          >
            {roomQuery.data.messages.map((message) => {
              const mine = message.senderId === session?.user.id;

              return (
                <ChatMessageBubble
                  body={message.body}
                  key={message.id}
                  meta={formatRelativeTime(message.createdAt)}
                  mine={mine}
                  onReportPress={
                    mine
                      ? undefined
                      : () => void handleReportMessage(message.id)
                  }
                />
              );
            })}
          </ChatMessageScroll>

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
