import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import { useEffect, useState } from "react";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonDescriptionText as DescriptionText,
  YeonFormStack as FormStack,
  YeonInfoListItem as InfoListItem,
  YeonMobileScreen as MobileScreen,
  YeonProfileHero as ProfileHero,
  YeonSectionCard as SectionCard,
  YeonSectionTitle as SectionTitle,
  YeonStateBlock as StateBlock,
  YeonSwitchSettingRow as SwitchSettingRow,
  YeonTextField as TextField,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { formatRelativeTime } from "../../../lib/format";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";
import {
  chatServiceApi,
  chatServiceApiBaseUrl,
} from "../../../services/chat-service/client";
import { chatServiceQueryKeys } from "../../../services/chat-service/query-keys";

export function ProfileScreen() {
  const queryClient = useQueryClient();
  const { logout, refreshSession, session, status } = useChatServiceSession();
  const isSignedIn = status === "signed_in";
  const sessionToken = session?.token ?? "";
  const [nickname, setNickname] = useState("");
  const [ageLabel, setAgeLabel] = useState("");
  const [regionLabel, setRegionLabel] = useState("");
  const [bio, setBio] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const profileQuery = useQuery({
    enabled: isSignedIn,
    queryFn: async () => {
      return chatServiceApi.getMyChatServiceProfile(sessionToken);
    },
    queryKey: chatServiceQueryKeys.profile,
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setNickname(profileQuery.data.profile.nickname);
    setAgeLabel(profileQuery.data.profile.ageLabel);
    setRegionLabel(profileQuery.data.profile.regionLabel);
    setBio(profileQuery.data.profile.bio);
    setNotificationsEnabled(profileQuery.data.profile.notificationsEnabled);
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.updateMyChatServiceProfile(sessionToken, {
        ageLabel: ageLabel.trim(),
        bio: bio.trim(),
        nickname: nickname.trim(),
        notificationsEnabled,
        regionLabel: regionLabel.trim(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
      await refreshSession();
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return chatServiceApi.unblockChatServiceProfile(sessionToken, profileId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.deleteMyChatServiceProfile(sessionToken);
    },
    onSuccess: async () => {
      await logout();
    },
  });

  async function handleSave() {
    try {
      await updateMutation.mutateAsync();
      showYeonAlert("저장 완료", "프로필 설정이 반영됐습니다.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "프로필 저장에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "계정 삭제에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleUnblock(profileId: string) {
    try {
      await unblockMutation.mutateAsync(profileId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "차단 해제에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  return (
    <MobileScreen>
      <TopBar
        rightLabel="로그아웃"
        onRightPress={() => {
          void logout();
        }}
        subtitle="프로필, 알림, 차단, 신고, 운영 연락처를 한 곳에서 관리합니다."
        title="프로필"
      />

      {profileQuery.isLoading ? (
        <StateBlock
          loading
          message="프로필을 불러오는 중입니다."
          title="내 정보 준비 중"
        />
      ) : null}

      {profileQuery.isError ? (
        <StateBlock
          message="프로필을 가져오지 못했습니다."
          title="프로필 로드 실패"
        />
      ) : null}

      {profileQuery.data ? (
        <>
          <SectionCard>
            <ProfileHero
              highlight={`보유 포인트 ${profileQuery.data.profile.points}P`}
              imageUrl={profileQuery.data.profile.avatarUrl}
              label={profileQuery.data.profile.nickname}
              meta={`${profileQuery.data.profile.regionLabel} · ${profileQuery.data.profile.ageLabel}`}
              title={profileQuery.data.profile.nickname}
            />
          </SectionCard>

          <SectionCard>
            <SectionTitle>프로필 편집</SectionTitle>
            <FormStack>
              <TextField
                label="닉네임"
                onChangeText={setNickname}
                value={nickname}
              />
              <TextField
                label="나이 표기"
                onChangeText={setAgeLabel}
                value={ageLabel}
              />
              <TextField
                label="지역 표기"
                onChangeText={setRegionLabel}
                value={regionLabel}
              />
              <TextField
                label="소개"
                multiline
                onChangeText={setBio}
                value={bio}
              />

              <SwitchSettingRow
                accessibilityLabel={
                  notificationsEnabled ? "알림 끄기" : "알림 켜기"
                }
                checked={notificationsEnabled}
                hint="친구 요청, DM 오픈, 새 메시지를 앱 알림으로 받습니다."
                label="알림 받기"
                onCheckedChange={setNotificationsEnabled}
              />

              <ActionButton
                disabled={updateMutation.isPending}
                label="프로필 저장"
                onPress={handleSave}
              />
            </FormStack>
          </SectionCard>

          <SectionCard>
            <SectionTitle>차단 목록</SectionTitle>
            <FormStack>
              {profileQuery.data.blockedProfiles.length > 0 ? (
                profileQuery.data.blockedProfiles.map((blocked) => (
                  <InfoListItem
                    key={blocked.id}
                    subtitle={`${blocked.regionLabel} ${blocked.ageLabel}`}
                    title={blocked.nickname}
                    titleTone="accent"
                    trailingSlot={
                      <ActionButton
                        label="해제"
                        onPress={() => void handleUnblock(blocked.id)}
                        variant="secondary"
                      />
                    }
                  />
                ))
              ) : (
                <DescriptionText>차단한 사용자가 없습니다.</DescriptionText>
              )}
            </FormStack>
          </SectionCard>

          <SectionCard>
            <SectionTitle>신고 내역</SectionTitle>
            <FormStack>
              {profileQuery.data.reports.length > 0 ? (
                profileQuery.data.reports.map((report) => (
                  <InfoListItem
                    key={report.id}
                    meta={`${report.targetType} · ${report.status}`}
                    subtitle={formatRelativeTime(report.createdAt)}
                    title={report.reason}
                  />
                ))
              ) : (
                <DescriptionText>아직 접수한 신고가 없습니다.</DescriptionText>
              )}
            </FormStack>
          </SectionCard>

          <SectionCard>
            <SectionTitle>운영 안내</SectionTitle>
            <FormStack>
              <DescriptionText>운영 연락처: support@yeon.world</DescriptionText>
              <DescriptionText>
                API 기본 주소: {chatServiceApiBaseUrl}
              </DescriptionText>
              <DescriptionText>
                계정 인증 전화번호:{" "}
                {profileQuery.data.profile.phoneNumberMasked}
              </DescriptionText>
            </FormStack>
          </SectionCard>

          <SectionCard>
            <SectionTitle>계정 관리</SectionTitle>
            <FormStack>
              <ActionButton
                label="계정 삭제"
                onPress={() => {
                  showYeonAlert(
                    "계정을 삭제할까요?",
                    "채팅, 친구, 신고 기록이 모두 제거됩니다.",
                    [
                      {
                        style: "cancel",
                        text: "취소",
                      },
                      {
                        onPress: () => {
                          void handleDeleteAccount();
                        },
                        style: "destructive",
                        text: "삭제",
                      },
                    ]
                  );
                }}
                variant="danger"
              />
            </FormStack>
          </SectionCard>
        </>
      ) : null}
    </MobileScreen>
  );
}
