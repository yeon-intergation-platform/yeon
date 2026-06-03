import type {
  ChatServiceFriendCardDto,
  ChatServiceProfileSummaryDto,
} from "@yeon/api-contract/chat-service";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import { useYeonRouter as useRouter } from "@yeon/ui/native";
import type { ReactNode } from "react";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonDescriptionText as DescriptionText,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonPillBadge as PillBadge,
  YeonProfileListRow as ProfileListRow,
  YeonSectionCard as SectionCard,
  YeonSectionTitle as SectionTitle,
  YeonStateBlock as StateBlock,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";
import { chatServiceApi } from "../../../services/chat-service/client";
import { chatServiceQueryKeys } from "../../../services/chat-service/query-keys";

export function FriendsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, status } = useChatServiceSession();
  const isSignedIn = status === "signed_in";
  const sessionToken = session?.token ?? "";

  const overviewQuery = useQuery({
    enabled: isSignedIn,
    queryFn: async () => {
      return chatServiceApi.getChatServiceFriendsOverview(sessionToken);
    },
    queryKey: chatServiceQueryKeys.friends,
  });

  const friendRequestMutation = useMutation({
    mutationFn: async (targetProfileId: string) => {
      return chatServiceApi.sendChatServiceFriendRequest(sessionToken, {
        targetProfileId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
    },
  });

  async function handleFriendRequest(profileId: string) {
    try {
      await friendRequestMutation.mutateAsync(profileId);
      showYeonAlert("친구 요청 전송", "상대에게 요청이 전달됐습니다.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "친구 요청 전송에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  function pushProfile(profile: ChatServiceProfileSummaryDto) {
    router.push(`/profile/${profile.id}`);
  }

  return (
    <MobileScreen>
      <TopBar
        rightLabel="새로고침"
        onRightPress={() => {
          void overviewQuery.refetch();
        }}
        subtitle="친구 목록, 요청 현황, 추천 사용자를 한 번에 보는 공간"
        title="친구"
      />

      {overviewQuery.isLoading ? (
        <StateBlock
          loading
          message="친구 정보를 가져오는 중입니다."
          title="목록 준비 중"
        />
      ) : null}

      {overviewQuery.isError ? (
        <StateBlock
          message="친구 목록을 가져오지 못했습니다."
          title="친구 로드 실패"
        />
      ) : null}

      {overviewQuery.data ? (
        <>
          <FriendsSection title="친구 목록">
            {overviewQuery.data.friends.length > 0 ? (
              overviewQuery.data.friends.map((friend) => (
                <FriendRow
                  key={friend.profile.id}
                  actionLabel="프로필"
                  card={friend}
                  onAction={() => pushProfile(friend.profile)}
                  onPress={() => pushProfile(friend.profile)}
                />
              ))
            ) : (
              <DescriptionText>아직 연결된 친구가 없습니다.</DescriptionText>
            )}
          </FriendsSection>

          <FriendsSection title="내가 보낸 요청">
            {overviewQuery.data.pendingSent.length > 0 ? (
              overviewQuery.data.pendingSent.map((friend) => (
                <FriendRow
                  key={friend.profile.id}
                  actionLabel="대기중"
                  card={friend}
                  onPress={() => pushProfile(friend.profile)}
                />
              ))
            ) : (
              <DescriptionText>보낸 요청이 없습니다.</DescriptionText>
            )}
          </FriendsSection>

          <FriendsSection title="받은 요청">
            {overviewQuery.data.pendingReceived.length > 0 ? (
              overviewQuery.data.pendingReceived.map((friend) => (
                <FriendRow
                  key={friend.profile.id}
                  actionLabel="프로필"
                  card={friend}
                  onAction={() => pushProfile(friend.profile)}
                  onPress={() => pushProfile(friend.profile)}
                />
              ))
            ) : (
              <DescriptionText>받은 요청이 없습니다.</DescriptionText>
            )}
          </FriendsSection>

          <FriendsSection title="추천 사용자">
            {overviewQuery.data.suggested.map((profile) => (
              <SuggestedRow
                key={profile.id}
                onAdd={() => void handleFriendRequest(profile.id)}
                onPress={() => pushProfile(profile)}
                profile={profile}
              />
            ))}
          </FriendsSection>
        </>
      ) : null}
    </MobileScreen>
  );
}

function FriendsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <SectionCard>
      <SectionTitle spacing="sm">{title}</SectionTitle>
      <FormStack>{children}</FormStack>
    </SectionCard>
  );
}

function FriendRow({
  card,
  actionLabel,
  onAction,
  onPress,
}: {
  card: ChatServiceFriendCardDto;
  actionLabel: string;
  onAction?: () => void;
  onPress: () => void;
}) {
  return (
    <ProfileListRow
      imageUrl={card.profile.avatarUrl}
      label={card.profile.nickname}
      meta={`${card.profile.regionLabel} ${card.profile.ageLabel}`}
      onPress={onPress}
      preview={card.previewText ?? undefined}
      title={card.profile.nickname}
      trailingSlot={
        <PillBadge
          label={actionLabel}
          onPress={onAction}
          tone={onAction ? "accent" : "neutral"}
        />
      }
    />
  );
}

function SuggestedRow({
  onAdd,
  onPress,
  profile,
}: {
  profile: ChatServiceProfileSummaryDto;
  onAdd: () => void;
  onPress: () => void;
}) {
  return (
    <ProfileListRow
      imageUrl={profile.avatarUrl}
      label={profile.nickname}
      meta={`${profile.regionLabel} ${profile.ageLabel}`}
      onPress={onPress}
      title={profile.nickname}
      trailingSlot={<PillBadge label="친구추가" onPress={onAdd} />}
    />
  );
}
