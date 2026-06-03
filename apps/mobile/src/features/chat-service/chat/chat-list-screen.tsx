import { useYeonQuery as useQuery } from "@yeon/ui/native";
import { useYeonRouter as useRouter } from "@yeon/ui/native";
import type { ChatServiceChatRoomDto } from "@yeon/api-contract/chat-service";
import { useCallback } from "react";
import {
  YeonFlatList as FlatList,
  YeonMobileScreen as MobileScreen,
  YeonPillBadge as PillBadge,
  YeonProfileListRow as ProfileListRow,
  YeonSectionCard as SectionCard,
  YeonStateBlock as StateBlock,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { formatRelativeTime } from "../../../lib/format";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";
import { chatServiceApi } from "../../../services/chat-service/client";
import { chatServiceQueryKeys } from "../../../services/chat-service/query-keys";

export function ChatListScreen() {
  const router = useRouter();
  const { session, status } = useChatServiceSession();
  const isSignedIn = status === "signed_in";
  const sessionToken = session?.token ?? "";

  const roomsQuery = useQuery({
    enabled: isSignedIn,
    queryFn: async () => {
      return chatServiceApi.listChatServiceRooms(sessionToken);
    },
    queryKey: chatServiceQueryKeys.rooms,
  });

  const keyExtractor = useCallback(
    (room: ChatServiceChatRoomDto) => room.id,
    []
  );

  const renderRoom = useCallback(
    ({ item: room }: { item: ChatServiceChatRoomDto }) => (
      <SectionCard>
        <ProfileListRow
          avatarSize={56}
          imageUrl={room.peer.avatarUrl}
          label={room.peer.nickname}
          meta={`${room.peer.regionLabel} ${room.peer.ageLabel}`}
          onPress={() => router.push(`/chat/${room.id}`)}
          preview={room.lastMessagePreview ?? "첫 메시지를 보내보세요."}
          title={room.peer.nickname}
          trailingSlot={
            <>
              <PillBadge
                label={
                  room.lastMessageAt
                    ? formatRelativeTime(room.lastMessageAt)
                    : "대화 준비"
                }
              />
              {room.unlockedByPayment ? <PillBadge label="100원 오픈" /> : null}
              {room.unreadCount > 0 ? (
                <PillBadge label={room.unreadCount} tone="accent" />
              ) : null}
            </>
          }
        />
      </SectionCard>
    ),
    [router]
  );

  const listHeader = (
    <>
      <TopBar
        rightLabel="새로고침"
        onRightPress={() => {
          void roomsQuery.refetch();
        }}
        subtitle="프로필에서 100원으로 연 대화와 기존 친구 대화를 모아봅니다."
        title="대화"
      />

      {roomsQuery.isLoading ? (
        <StateBlock
          loading
          message="채팅방 목록을 준비하고 있습니다."
          title="대화 불러오는 중"
        />
      ) : null}

      {roomsQuery.isError ? (
        <StateBlock
          message="채팅방 목록을 가져오지 못했습니다."
          title="대화 로드 실패"
        />
      ) : null}
    </>
  );

  // 로딩/에러 중에는 빈 상태 안내를 띄우지 않는다(중복 메시지 방지).
  const listEmpty =
    roomsQuery.isLoading || roomsQuery.isError ? null : (
      <StateBlock
        message="친구 탭이나 프로필 화면에서 먼저 대화를 열어보세요."
        title="아직 열린 대화가 없습니다"
      />
    );

  return (
    <MobileScreen contentVariant="full" scroll={false}>
      <FlatList
        contentContainerStyle={{
          gap: 16,
          paddingBottom: 120,
          paddingHorizontal: 18,
          paddingTop: 22,
        }}
        data={roomsQuery.data?.rooms ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={listHeader}
        renderItem={renderRoom}
        style={{ flex: 1 }}
      />
    </MobileScreen>
  );
}
