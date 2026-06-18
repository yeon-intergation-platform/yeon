import type { ReactNode } from "react";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "운영 홈" },
  { href: "/admin/content", label: "공개 콘텐츠" },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/users", label: "사용자 · 경험치" },
  { href: "/admin/typing-decks", label: "타자 덱" },
  { href: "/admin/typing-characters", label: "타자 캐릭터" },
  { href: "/admin/typing-rooms", label: "타자방 운영" },
] as const;

type AdminPageShellProps = {
  adminEmail: string;
  children: ReactNode;
  currentHref: string;
  sectionLabel: string;
};

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
  sectionLabel,
}: AdminPageShellProps) {
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
              관리자
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
                  {item.label}
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
  description = "admin role 계정만 접근할 수 있습니다.",
  seedEmailCount,
}: {
  description?: string;
  seedEmailCount?: number;
}) {
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
          관리자 전용
        </YeonText>
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="mt-2 text-[26px] font-semibold text-[#111]"
        >
          관리자 권한이 필요합니다
        </YeonText>
        <YeonText
          variant="unstyled"
          tone="inherit"
          className="mt-3 text-[14px] leading-6 text-[#666]"
        >
          {description}
          {typeof seedEmailCount === "number"
            ? ` 시드 이메일은 ${seedEmailCount.toLocaleString("ko-KR")}개 설정되어 있습니다.`
            : null}
        </YeonText>
        <YeonView className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-6"}>
          <YeonLink
            href="/auth/login"
            className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
          >
            로그인하기
          </YeonLink>
          <YeonLink href="/" className={SHARED_FEATURE_CLASS.ghostButtonMd14}>
            홈으로
          </YeonLink>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
