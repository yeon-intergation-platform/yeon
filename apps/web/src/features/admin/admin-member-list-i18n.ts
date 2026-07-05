import type { PlatformLanguage } from "@/lib/platform-language";

const ADMIN_MEMBER_TEXT = {
  ko: {
    locale: "ko-KR",
    noName: "이름 없음",
    stats: {
      total: "전체 회원",
      admin: "관리자",
      activeSessions: "활성 세션",
      serviceData: "보유 데이터",
    },
    heading: "회원 목록",
    description:
      "검색, 표시 이름 수정, 역할 변경, 세션 무효화, 계정 삭제를 한 화면에서 처리합니다.",
    searchPlaceholder: "이메일, 이름, user id 검색",
    allRoles: "전체 역할",
    empty: "조건에 맞는 회원이 없습니다.",
    columns: {
      member: "회원",
      displayName: "표시 이름",
      role: "role",
      data: "연결/데이터",
      lastLogin: "최근 로그인",
      actions: "관리",
    },
    joinedAt: (date: string) => `가입 ${date}`,
    save: "저장",
    sessionSummary: (count: string) => `세션 ${count}개`,
    dataSummary: (cardDecks: string, typingDecks: string) =>
      `카드 ${cardDecks} · 타자 ${typingDecks}`,
    noProviders: "연결 provider 없음",
    emailVerified: (date: string) => `이메일 인증 ${date}`,
    invalidateSessions: "세션 정리",
    delete: "삭제",
    selfDeleteTitle: "본인 계정은 프로필 회원탈퇴에서 처리합니다.",
    deleteTitle: "사용자 삭제",
    deletePrompt: (email: string) =>
      `${email} 계정을 삭제하려면 이메일을 그대로 입력하세요.`,
    saveNameFailed: "표시 이름을 저장하지 못했습니다.",
    saveNameSuccess: "표시 이름을 저장했습니다.",
    roleFailed: "역할을 변경하지 못했습니다.",
    roleSuccess: "역할을 변경했습니다.",
    sessionsFailed: "세션을 정리하지 못했습니다.",
    sessionsSuccess: (count: string) => `${count}개 세션을 정리했습니다.`,
    deleteFailed: "사용자를 삭제하지 못했습니다.",
    deleteSuccess: "사용자를 삭제했습니다.",
  },
  en: {
    locale: "en-US",
    noName: "No name",
    stats: {
      total: "Total users",
      admin: "Admins",
      activeSessions: "Active sessions",
      serviceData: "Owned data",
    },
    heading: "Member List",
    description:
      "Search members, edit display names, change roles, invalidate sessions, and delete accounts in one place.",
    searchPlaceholder: "Search email, name, or user id",
    allRoles: "All roles",
    empty: "No members match the current filters.",
    columns: {
      member: "Member",
      displayName: "Display name",
      role: "Role",
      data: "Connections / data",
      lastLogin: "Last login",
      actions: "Actions",
    },
    joinedAt: (date: string) => `Joined ${date}`,
    save: "Save",
    sessionSummary: (count: string) =>
      `${count} active ${count === "1" ? "session" : "sessions"}`,
    dataSummary: (cardDecks: string, typingDecks: string) =>
      `${cardDecks} card decks · ${typingDecks} typing decks`,
    noProviders: "No connected providers",
    emailVerified: (date: string) => `Email verified ${date}`,
    invalidateSessions: "Invalidate sessions",
    delete: "Delete",
    selfDeleteTitle: "Delete your own account from the profile page.",
    deleteTitle: "Delete user",
    deletePrompt: (email: string) =>
      `Type ${email} exactly to delete this account.`,
    saveNameFailed: "Could not save the display name.",
    saveNameSuccess: "Display name saved.",
    roleFailed: "Could not change the role.",
    roleSuccess: "Role changed.",
    sessionsFailed: "Could not invalidate sessions.",
    sessionsSuccess: (count: string) =>
      `${count} ${count === "1" ? "session" : "sessions"} invalidated.`,
    deleteFailed: "Could not delete the user.",
    deleteSuccess: "User deleted.",
  },
} as const;

export type AdminMemberText =
  (typeof ADMIN_MEMBER_TEXT)[keyof typeof ADMIN_MEMBER_TEXT];

export function getAdminMemberListText(language: PlatformLanguage) {
  return ADMIN_MEMBER_TEXT[language];
}
