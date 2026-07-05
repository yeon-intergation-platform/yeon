import type { ReactNode } from "react";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import type { PlatformLanguage } from "@/lib/platform-language";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", labels: { ko: "운영 홈", en: "Ops home" } },
  {
    href: "/admin/content",
    labels: { ko: "공개 콘텐츠", en: "Public content" },
  },
  { href: "/admin/members", labels: { ko: "회원 관리", en: "Members" } },
  { href: "/admin/users", labels: { ko: "사용자 · 경험치", en: "Users · XP" } },
  {
    href: "/admin/typing-decks",
    labels: { ko: "타자 덱", en: "Typing decks" },
  },
  {
    href: "/admin/typing-characters",
    labels: { ko: "타자 캐릭터", en: "Typing characters" },
  },
  {
    href: "/admin/typing-rooms",
    labels: { ko: "타자방 운영", en: "Typing rooms" },
  },
] as const;

type AdminPageShellProps = {
  adminEmail: string;
  children: ReactNode;
  currentHref: string;
  language?: PlatformLanguage;
  sectionLabel: string;
};

const ADMIN_SHELL_TEXT = {
  ko: {
    admin: "관리자",
    accessOnly: "관리자 전용",
    accessRequired: "관리자 권한이 필요합니다",
    defaultDeniedDescription: "admin role 계정만 접근할 수 있습니다.",
    seedEmailCount: (count: number) =>
      ` 시드 이메일은 ${count.toLocaleString("ko-KR")}개 설정되어 있습니다.`,
    login: "로그인하기",
    home: "홈으로",
  },
  en: {
    admin: "Admin",
    accessOnly: "Admin only",
    accessRequired: "Admin access required",
    defaultDeniedDescription:
      "Only accounts with the admin role can access this page.",
    seedEmailCount: (count: number) =>
      ` ${count.toLocaleString("en-US")} seed ${
        count === 1 ? "email is" : "emails are"
      } configured.`,
    login: "Log in",
    home: "Home",
  },
} as const;

function isCurrentAdminNavItem(itemHref: string, currentHref: string) {
  if (itemHref === "/admin") {
    return currentHref === itemHref;
  }

  return currentHref === itemHref || currentHref.startsWith(`${itemHref}/`);
}

export function AdminPageShell({
  adminEmail,
  children,
  currentHref,
  language = "ko",
  sectionLabel,
}: AdminPageShellProps) {
  const shellText = ADMIN_SHELL_TEXT[language];

  return (
    <YeonView className="min-h-screen bg-white text-[#111]">
      <YeonView className="border-b border-[#e5e5e5] bg-white px-6 py-3 md:px-12">
        <YeonView className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <YeonView>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
            >
              {shellText.admin}
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[14px] font-semibold"
            >
              {adminEmail} · {sectionLabel}
            </YeonText>
          </YeonView>
          <YeonView className={SHARED_FEATURE_CLASS.wrapGap2}>
            {ADMIN_NAV_ITEMS.map((item) => {
              const isCurrent = isCurrentAdminNavItem(item.href, currentHref);
              return (
                <YeonLink
                  key={item.href}
                  href={item.href}
                  className={
                    isCurrent
                      ? SHARED_FEATURE_CLASS.primaryActionButtonMd13
                      : SHARED_FEATURE_CLASS.ghostButtonMd13
                  }
                >
                  {item.labels[language]}
                </YeonLink>
              );
            })}
          </YeonView>
        </YeonView>
      </YeonView>
      {children}
    </YeonView>
  );
}

export function AdminAccessDenied({
  description,
  language = "ko",
  seedEmailCount,
}: {
  description?: string;
  language?: PlatformLanguage;
  seedEmailCount?: number;
}) {
  const shellText = ADMIN_SHELL_TEXT[language];

  return (
    <YeonView
      as="main"
      className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]"
    >
      <YeonView
        as="section"
        className="max-w-xl rounded-lg border border-[#e5e5e5] bg-white p-8"
      >
        <YeonText
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
        >
          {shellText.accessOnly}
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-semibold text-[#111]"
        >
          {shellText.accessRequired}
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 text-[14px] leading-6 text-[#666]"
        >
          {description ?? shellText.defaultDeniedDescription}
          {typeof seedEmailCount === "number"
            ? shellText.seedEmailCount(seedEmailCount)
            : null}
        </YeonText>
        <YeonView className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-6"}>
          <YeonLink
            href="/auth/login"
            className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
          >
            {shellText.login}
          </YeonLink>
          <YeonLink href="/" className={SHARED_FEATURE_CLASS.ghostButtonMd14}>
            {shellText.home}
          </YeonLink>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
