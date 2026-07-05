import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { AdminMemberList } from "@/features/admin/admin-member-list";
import { AdminPageShell } from "@/features/admin/admin-shell";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import type { PlatformLanguage } from "@/lib/platform-language";
import { resolvePlatformLanguageFromRequest } from "@/lib/platform-language-server";
import { getAdminSeedEmails, getCurrentAdminUser } from "@/server/auth/admin";
import {
  fetchUsersFromSpring,
  UsersSpringBackendHttpError,
} from "@/server/users-spring-client";

const ADMIN_MEMBERS_PAGE_TEXT = {
  ko: {
    metadataTitle: "회원 관리 | YEON Admin",
    accessOnly: "관리자 전용",
    accessRequired: "관리자 권한이 필요합니다",
    deniedStart: "회원관리 페이지는 DB role이",
    deniedMiddle: "인 계정만 접근할 수 있습니다. 최초 관리자는 운영 환경변수",
    deniedEnd: "에 이메일을 넣고 로그인하면 자동으로 admin role로 승격됩니다.",
    seedSetting: "현재 시드 설정",
    seedConfigured: (count: number) =>
      `${count.toLocaleString("ko-KR")}개 이메일이 설정되어 있습니다.`,
    seedMissing: "아직 시드 이메일이 설정되어 있지 않습니다.",
    login: "로그인하기",
    home: "홈으로",
    listErrorLabel: "회원 목록 오류",
    listErrorTitle: "회원 정보를 불러오지 못했습니다",
    sectionLabel: "회원 관리",
    unexpectedError: "예상하지 못한 오류가 발생했습니다.",
    backendError: "회원 정보를 불러오지 못했습니다.",
  },
  en: {
    metadataTitle: "Member Management | YEON Admin",
    accessOnly: "Admin only",
    accessRequired: "Admin access required",
    deniedStart:
      "The member management page is only available to accounts with the DB role",
    deniedMiddle:
      ". The first admin is promoted automatically when their email is listed in",
    deniedEnd: "and they log in.",
    seedSetting: "Current seed setting",
    seedConfigured: (count: number) =>
      `${count.toLocaleString("en-US")} ${
        count === 1 ? "email is" : "emails are"
      } configured.`,
    seedMissing: "No seed emails are configured yet.",
    login: "Log in",
    home: "Home",
    listErrorLabel: "Member list error",
    listErrorTitle: "Could not load member information",
    sectionLabel: "Member management",
    unexpectedError: "An unexpected error occurred.",
    backendError: "Could not load member information.",
  },
} as const;

function getAdminMembersPageText(language: PlatformLanguage) {
  return ADMIN_MEMBERS_PAGE_TEXT[language];
}

export async function generateMetadata(): Promise<YeonPageMetadata> {
  const language = await resolvePlatformLanguageFromRequest();
  const text = getAdminMembersPageText(language);

  return {
    title: text.metadataTitle,
    robots: NON_INDEXABLE_ROBOTS,
  };
}

function AdminDenied({ language }: { language: PlatformLanguage }) {
  const text = getAdminMembersPageText(language);
  const seedEmails = Array.from(getAdminSeedEmails());
  const hasSeedEmail = seedEmails.some(Boolean);

  const adminRole = (
    <YeonText as="strong" variant="unstyled" tone="inherit">
      admin
    </YeonText>
  );
  const yeonAdminEmails = (
    <YeonText as="code" variant="unstyled" tone="inherit">
      YEON_ADMIN_EMAILS
    </YeonText>
  );
  const adminEmails = (
    <YeonText as="code" variant="unstyled" tone="inherit">
      ADMIN_EMAILS
    </YeonText>
  );

  const deniedDescription =
    language === "ko" ? (
      <>
        {text.deniedStart} {adminRole}
        {text.deniedMiddle} {yeonAdminEmails} 또는 {adminEmails}
        {text.deniedEnd}
      </>
    ) : (
      <>
        {text.deniedStart} {adminRole}
        {text.deniedMiddle} {yeonAdminEmails} or {adminEmails} {text.deniedEnd}
      </>
    );

  return (
    <YeonView
      as="main"
      className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]"
    >
      <YeonView
        as="section"
        className="max-w-xl rounded-2xl border border-[#e5e5e5] bg-white p-8"
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
        >
          {text.accessOnly}
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#111]"
        >
          {text.accessRequired}
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 text-[14px] leading-6 text-[#666]"
        >
          {deniedDescription}
        </YeonText>
        <YeonView className="mt-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#666]">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="font-bold text-[#111]"
          >
            {text.seedSetting}
          </YeonText>
          <YeonText variant="unstyled" tone="inherit" className="mt-1">
            {hasSeedEmail
              ? text.seedConfigured(seedEmails.length)
              : text.seedMissing}
          </YeonText>
        </YeonView>
        <YeonView className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-6"}>
          <YeonLink
            href="/auth/login"
            className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
          >
            {text.login}
          </YeonLink>
          <YeonLink href="/" className={SHARED_FEATURE_CLASS.ghostButtonMd14}>
            {text.home}
          </YeonLink>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

function AdminMemberListError({
  language,
  message,
}: {
  language: PlatformLanguage;
  message: string;
}) {
  const text = getAdminMembersPageText(language);

  return (
    <YeonView
      as="main"
      className="min-h-screen bg-white px-6 py-12 text-[#111] md:px-12"
    >
      <YeonView
        as="section"
        className="mx-auto max-w-2xl rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-8"
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
        >
          {text.listErrorLabel}
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-black tracking-[-0.04em]"
        >
          {text.listErrorTitle}
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-4 text-[14px] leading-6 text-[#666]"
        >
          {message}
        </YeonText>
      </YeonView>
    </YeonView>
  );
}

function resolveBackendErrorMessage(
  language: PlatformLanguage,
  error: UsersSpringBackendHttpError
) {
  if (language === "ko") {
    return error.message;
  }

  return getAdminMembersPageText(language).backendError;
}

export default async function AdminMembersPage() {
  const language = await resolvePlatformLanguageFromRequest();
  const text = getAdminMembersPageText(language);
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return <AdminDenied language={language} />;
  }

  try {
    const result = await fetchUsersFromSpring(adminUser.id);

    return (
      <AdminPageShell
        adminEmail={adminUser.email}
        currentHref="/admin/members"
        language={language}
        sectionLabel={text.sectionLabel}
      >
        <AdminMemberList
          currentAdminUserId={adminUser.id}
          initialLanguage={language}
          users={result.users}
        />
      </AdminPageShell>
    );
  } catch (error) {
    if (error instanceof UsersSpringBackendHttpError) {
      return (
        <AdminMemberListError
          language={language}
          message={resolveBackendErrorMessage(language, error)}
        />
      );
    }

    console.error(error);
    return (
      <AdminMemberListError
        language={language}
        message={text.unexpectedError}
      />
    );
  }
}
