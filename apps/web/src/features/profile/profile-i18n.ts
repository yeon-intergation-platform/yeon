import {
  PLATFORM_PROFILE_MENU_LABELS,
  type PlatformLanguage,
} from "@/lib/platform-language";

export type ProfileLanguage = PlatformLanguage;

export type ProfileText = {
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
};

const PROFILE_TEXT: Record<ProfileLanguage, ProfileText> = {
  ko: {
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
  },
  en: {
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
  },
};

export function getProfileText(language: ProfileLanguage) {
  return PROFILE_TEXT[language];
}
