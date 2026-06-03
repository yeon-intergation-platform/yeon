import { CHAT_SERVICE_DM_UNLOCK_AMOUNT } from "@yeon/api-contract/chat-service";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import {
  useYeonLocalSearchParams as useLocalSearchParams,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonDescriptionText as DescriptionText,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonProfileHero as ProfileHero,
  YeonSectionCard as SectionCard,
  YeonSectionTitle as SectionTitle,
  YeonStateBlock as StateBlock,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { parseOptionalString } from "../../../lib/format";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";
import { chatServiceApi } from "../../../services/chat-service/client";
import { chatServiceQueryKeys } from "../../../services/chat-service/query-keys";

export function ProfileDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profileId: rawProfileId } = useLocalSearchParams();
  const { session, status } = useChatServiceSession();
  const isSignedIn = status === "signed_in";
  const sessionToken = session?.token ?? "";
  const profileId = parseOptionalString(rawProfileId) ?? "";

  const profileQuery = useQuery({
    enabled: isSignedIn && Boolean(profileId),
    queryFn: async () => {
      return chatServiceApi.getChatServiceProfile(sessionToken, profileId);
    },
    queryKey: chatServiceQueryKeys.publicProfile(profileId),
  });

  const overviewQuery = useQuery({
    enabled: isSignedIn && Boolean(profileId),
    queryFn: async () => {
      return chatServiceApi.getChatServiceFriendsOverview(sessionToken);
    },
    queryKey: chatServiceQueryKeys.friends,
  });

  const reportDraft = "프로필 신고";

  const friendMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.sendChatServiceFriendRequest(sessionToken, {
        targetProfileId: profileId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
    },
  });

  const dmMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.openChatServiceRoom(sessionToken, {
        targetProfileId: profileId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.rooms,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.publicProfile(profileId),
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.blockChatServiceProfile(sessionToken, profileId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.publicProfile(profileId),
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.unblockChatServiceProfile(sessionToken, profileId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.publicProfile(profileId),
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.createChatServiceReport(sessionToken, {
        reason: reportDraft,
        targetId: profileId,
        targetType: "profile",
      });
    },
  });

  const isBlocked =
    overviewQuery.data?.blocked.some((blocked) => blocked.id === profileId) ??
    false;
  const profile = profileQuery.data?.profile;

  async function handleFriendRequest() {
    try {
      await friendMutation.mutateAsync();
      showYeonAlert("친구 요청 전송", "상대에게 요청을 보냈습니다.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "친구 요청에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleDmOpen() {
    try {
      const response = await dmMutation.mutateAsync();
      showYeonAlert(
        "대화 오픈",
        response.room.unlockedByPayment
          ? `${CHAT_SERVICE_DM_UNLOCK_AMOUNT}원이 차감되고 대화방이 열렸습니다.`
          : "이미 열린 대화방으로 이동합니다."
      );
      router.push(`/chat/${response.room.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "대화 오픈에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleReport() {
    try {
      await reportMutation.mutateAsync();
      showYeonAlert("신고 접수", "운영팀이 프로필을 검토합니다.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "프로필 신고에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleBlockToggle() {
    try {
      if (isBlocked) {
        await unblockMutation.mutateAsync();
        showYeonAlert("차단 해제", "이제 다시 친구 요청과 대화가 가능합니다.");
      } else {
        await blockMutation.mutateAsync();
        showYeonAlert("차단 완료", "친구 요청과 대화 열기가 차단됩니다.", [
          {
            onPress: () => {
              router.back();
            },
            text: "확인",
          },
        ]);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "차단 처리에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  return (
    <MobileScreen>
      <TopBar
        rightLabel="뒤로"
        onRightPress={() => router.back()}
        subtitle="프로필에서 친구 요청과 100원 DM 오픈을 바로 실행합니다."
        title="프로필 보기"
      />

      {!profileId ? (
        <StateBlock
          message="프로필 식별자가 없어 화면을 열 수 없습니다."
          title="프로필 진입 오류"
        />
      ) : null}

      {profileQuery.isLoading ? (
        <StateBlock
          loading
          message="프로필 정보를 불러오는 중입니다."
          title="프로필 준비 중"
        />
      ) : null}

      {profileQuery.isError ? (
        <StateBlock
          message={
            profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "프로필을 불러오지 못했습니다."
          }
          title="프로필 로드 실패"
        />
      ) : null}

      {profile ? (
        <>
          <SectionCard>
            <ProfileHero
              highlight={`표시 포인트 ${profile.points}P`}
              imageUrl={profile.avatarUrl}
              label={profile.nickname}
              meta={`${profile.regionLabel} ${profile.ageLabel}`}
              size={84}
              title={profile.nickname}
            />
          </SectionCard>

          <SectionCard>
            <SectionTitle spacing="sm">한 줄 소개</SectionTitle>
            <DescriptionText line="roomy">
              {profile.bio || "아직 등록된 소개가 없습니다."}
            </DescriptionText>
          </SectionCard>

          <SectionCard>
            <SectionTitle spacing="sm">바로 실행</SectionTitle>
            <FormStack gap="compact">
              <ActionButton label="친구 요청" onPress={handleFriendRequest} />
              <ActionButton
                label={`${CHAT_SERVICE_DM_UNLOCK_AMOUNT}원으로 대화 열기`}
                onPress={() => {
                  showYeonAlert(
                    "대화를 열까요?",
                    `${CHAT_SERVICE_DM_UNLOCK_AMOUNT}원이 차감될 수 있습니다.`,
                    [
                      {
                        style: "cancel",
                        text: "취소",
                      },
                      {
                        onPress: () => {
                          void handleDmOpen();
                        },
                        text: "열기",
                      },
                    ]
                  );
                }}
                variant="secondary"
              />
              <ActionButton
                label={isBlocked ? "차단 해제" : "차단하기"}
                onPress={handleBlockToggle}
                variant={isBlocked ? "secondary" : "danger"}
              />
              <ActionButton
                label="신고하기"
                onPress={handleReport}
                variant="danger"
              />
            </FormStack>
          </SectionCard>

          <SectionCard>
            <SectionTitle spacing="sm">운영 메모</SectionTitle>
            <DescriptionText line="roomy">
              상대 동의 없이도 프로필 진입 후 {CHAT_SERVICE_DM_UNLOCK_AMOUNT}원
              결제로 1:1 DM을 열 수 있습니다. 수신 거부 기능은 후속 차수에서
              추가됩니다.
            </DescriptionText>
          </SectionCard>
        </>
      ) : null}
    </MobileScreen>
  );
}
