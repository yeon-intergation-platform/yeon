import {
  PLATFORM_PROFILE_MENU_LABELS,
  type PlatformLanguage,
} from "@/lib/platform-language";

export type ProfileLanguage = PlatformLanguage;

export type ProfileText = {
  metadataTitle: string;
  metadataDescription: string;
  brandLabel: string;
  eyebrow: string;
  title: string;
  email: string;
  providers: string;
  lastLogin: string;
  loginRequired: string;
  loginAction: string;
  sessionErrorTitle: string;
  sessionErrorDescription: string;
  cleanupAction: string;
  profileMenu: (typeof PLATFORM_PROFILE_MENU_LABELS)[ProfileLanguage];
  dateLocale: string;
  experience: {
    levelHeading: string;
    historyHeading: string;
    loadError: string;
    loading: string;
    historyLoadError: string;
    historyLoading: string;
    emptyHistory: string;
    levelAriaLabel: (level: number) => string;
    activityLabels: Record<string, string>;
  };
  edit: {
    title: string;
    description: string;
    avatarAlt: string;
    uploading: string;
    changePhoto: string;
    removePhoto: string;
    displayNameLabel: string;
    displayNamePlaceholder: string;
    save: string;
    saving: string;
    displayNameRequired: string;
    uploadFailed: string;
    saveFailed: string;
    saveOk: string;
  };
  danger: {
    title: string;
    description: string;
    confirmationLabel: string;
    confirmationPlaceholder: string;
    confirmationValue: string;
    action: string;
    processing: string;
    required: string;
    failed: string;
  };
};

const PROFILE_TEXT: Record<ProfileLanguage, ProfileText> = {
  ko: {
    metadataTitle: "내정보 | YEON",
    metadataDescription: "YEON 계정 정보와 프로필 설정을 확인합니다.",
    brandLabel: "YEON 내정보",
    eyebrow: "My profile",
    title: "내정보",
    email: "이메일",
    providers: "로그인 방식",
    lastLogin: "최근 로그인",
    loginRequired: "내정보를 보려면 로그인이 필요합니다.",
    loginAction: "로그인하고 내정보 보기",
    sessionErrorTitle: "로그인 상태를 다시 확인해야 합니다.",
    sessionErrorDescription:
      "저장된 세션이 만료되었거나 인증 서버 응답을 읽지 못했습니다. 세션을 정리한 뒤 다시 로그인해 주세요.",
    cleanupAction: "세션 정리 후 다시 시도",
    profileMenu: PLATFORM_PROFILE_MENU_LABELS.ko,
    dateLocale: "ko-KR",
    experience: {
      levelHeading: "Level & XP",
      historyHeading: "Experience history",
      loadError: "경험치 정보를 불러오지 못했습니다.",
      loading: "경험치 정보를 불러오는 중입니다.",
      historyLoadError: "경험치 이력을 불러오지 못했습니다.",
      historyLoading: "경험치 이력을 불러오는 중입니다.",
      emptyHistory: "아직 적립된 경험치가 없습니다.",
      levelAriaLabel: (level) => `레벨 ${level} 경험치 보기`,
      activityLabels: {
        deck_created: "카드덱 생성",
        card_room_finished: "카드방 학습 완료",
        typing_race_finished: "타자 레이스 완료",
        community_post: "커뮤니티 활동",
        daily_login: "출석",
        game_play: "게임 플레이",
      },
    },
    edit: {
      title: "프로필 등록",
      description:
        "닉네임과 프로필 사진은 게임 댓글 등 사이트 곳곳에 표시됩니다.",
      avatarAlt: "프로필 사진",
      uploading: "업로드 중...",
      changePhoto: "사진 변경",
      removePhoto: "사진 제거",
      displayNameLabel: "닉네임",
      displayNamePlaceholder: "닉네임",
      save: "저장",
      saving: "저장 중...",
      displayNameRequired: "닉네임을 입력해 주세요.",
      uploadFailed: "이미지를 업로드하지 못했습니다.",
      saveFailed: "프로필을 저장하지 못했습니다.",
      saveOk: "프로필을 저장했어요.",
    },
    danger: {
      title: "회원탈퇴",
      description:
        "계정을 삭제하면 세션과 YEON 서비스 데이터가 함께 정리되며 되돌릴 수 없습니다.",
      confirmationLabel: "확인을 위해 회원탈퇴를 입력하세요.",
      confirmationPlaceholder: "회원탈퇴",
      confirmationValue: "회원탈퇴",
      action: "회원탈퇴",
      processing: "탈퇴 처리 중...",
      required: "확인 문구를 정확히 입력해 주세요.",
      failed: "회원탈퇴를 처리하지 못했습니다.",
    },
  },
  en: {
    metadataTitle: "Profile | YEON",
    metadataDescription: "View your YEON account and profile settings.",
    brandLabel: "YEON Profile",
    eyebrow: "My profile",
    title: "Profile",
    email: "Email",
    providers: "Login methods",
    lastLogin: "Last login",
    loginRequired: "Sign in to view your profile.",
    loginAction: "Sign in and view profile",
    sessionErrorTitle: "Your sign-in state needs to be refreshed.",
    sessionErrorDescription:
      "The saved session may have expired or the auth server response could not be read. Clear the session and sign in again.",
    cleanupAction: "Clear session and retry",
    profileMenu: PLATFORM_PROFILE_MENU_LABELS.en,
    dateLocale: "en-US",
    experience: {
      levelHeading: "Level & XP",
      historyHeading: "Experience history",
      loadError: "Could not load XP information.",
      loading: "Loading XP information.",
      historyLoadError: "Could not load XP history.",
      historyLoading: "Loading XP history.",
      emptyHistory: "No XP has been earned yet.",
      levelAriaLabel: (level) => `View level ${level} XP`,
      activityLabels: {
        deck_created: "Card deck created",
        card_room_finished: "Card study finished",
        typing_race_finished: "Typing race finished",
        community_post: "Community activity",
        daily_login: "Daily login",
        game_play: "Game played",
      },
    },
    edit: {
      title: "Profile",
      description:
        "Your display name and profile photo appear in comments and other YEON services.",
      avatarAlt: "Profile photo",
      uploading: "Uploading...",
      changePhoto: "Change photo",
      removePhoto: "Remove photo",
      displayNameLabel: "Display name",
      displayNamePlaceholder: "Display name",
      save: "Save",
      saving: "Saving...",
      displayNameRequired: "Enter a display name.",
      uploadFailed: "Could not upload the image.",
      saveFailed: "Could not save the profile.",
      saveOk: "Profile saved.",
    },
    danger: {
      title: "Delete account",
      description:
        "Deleting your account also removes active sessions and YEON service data. This cannot be undone.",
      confirmationLabel: "Type DELETE to confirm.",
      confirmationPlaceholder: "DELETE",
      confirmationValue: "DELETE",
      action: "Delete account",
      processing: "Deleting...",
      required: "Enter the confirmation text exactly.",
      failed: "Could not delete the account.",
    },
  },
};

export function getProfileText(language: ProfileLanguage) {
  return PROFILE_TEXT[language];
}
