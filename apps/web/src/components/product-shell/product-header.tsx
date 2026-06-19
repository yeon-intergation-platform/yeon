"use client";
import { useEffect, useState, type ReactNode } from "react";
import {
  YeonLink,
  YeonProductHeader,
  YeonProductHeaderActionButton,
  YeonProductProfileMenu,
  type YeonProductProfileMenuLabels,
  YeonText,
  YeonView,
  fetchYeon,
} from "@yeon/ui";
import { useYeonPathname } from "@yeon/ui/runtime/YeonNavigation";
import { TypingBgmButton } from "@/features/typing-service/typing-bgm-button";
import { HeaderExperienceBadge } from "@/features/user-experience/header-experience-badge";
import { resolveSectionBrandHref } from "@/lib/header-brand-nav";
import { useLogout } from "@/lib/use-logout";

type CommonServiceKey = "home" | "typing" | "card" | "community" | "game";

// 서비스 키 → 내부 베이스 경로. SERVICE_SUBDOMAIN_ROUTES(subdomain-routing.ts)의
// servicePath와 같은 값이며, 좌상단 "한 단계 위" 네비게이션 계산에만 쓴다.
const SERVICE_BASE_PATH: Record<Exclude<CommonServiceKey, "home">, string> = {
  typing: "/typing-service",
  card: "/card-service",
  community: "/community",
  game: "/game-service",
} as const;

type CommonProductHeaderProps = {
  activeService: CommonServiceKey;
  ariaLabel?: string;
  brandLabel?: string;
  settingsControl?: ReactNode;
  profileControl?: ReactNode;
  profileLabels?: Partial<YeonProductProfileMenuLabels>;
  levelAriaLabel?: (level: number) => string;
  rightExtras?: ReactNode;
};

type AuthSessionPayload = {
  authenticated?: unknown;
};

const COMMON_HEADER_BRAND_LABELS: Record<CommonServiceKey, string> = {
  home: "YEON",
  typing: "YEON 타자방",
  card: "YEON 플래시카드",
  community: "YEON 커뮤니티",
  game: "YEON 게임",
} as const;

async function fetchIsAuthenticated() {
  const response = await fetchYeon("/api/v1/auth/session", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as AuthSessionPayload;
  return payload.authenticated === true;
}

export const ProductHeader = YeonProductHeader;
export const ProductHeaderSettingsButton = YeonProductHeaderActionButton;

export function CommonProductHeader({
  activeService,
  ariaLabel = "YEON 공통 서비스 이동",
  brandLabel = COMMON_HEADER_BRAND_LABELS[activeService],
  settingsControl,
  profileControl,
  profileLabels,
  levelAriaLabel,
  rightExtras,
}: CommonProductHeaderProps) {
  const pathname = useYeonPathname();
  // 좌상단 "한 단계 위": 하위 화면 → 서비스 홈, 서비스 홈 → 플랫폼(yeon.world).
  // 플랫폼 홈(home) 자체에서는 그대로 루트를 가리킨다.
  const brandHref =
    activeService === "home"
      ? "/"
      : resolveSectionBrandHref(SERVICE_BASE_PATH[activeService], pathname);

  return (
    <YeonProductHeader
      as="nav"
      ariaLabel={ariaLabel}
      innerClassName="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-6"
    >
      <YeonLink
        href={brandHref}
        aria-current={activeService === "home" ? "page" : undefined}
        className="min-w-0 text-[19px] font-black tracking-[-0.04em] text-[#111] no-underline transition-opacity hover:opacity-70 md:text-[23px]"
      >
        {brandLabel}
      </YeonLink>

      <YeonView aria-hidden="true" />

      <YeonView className="flex min-w-0 items-center justify-end gap-2">
        {rightExtras ? (
          <YeonView className="hidden items-center gap-2 md:flex">
            {rightExtras}
          </YeonView>
        ) : null}
        <YeonView className="hidden shrink-0 md:block">
          <HeaderExperienceBadge levelAriaLabel={levelAriaLabel} />
        </YeonView>
        <YeonView className="hidden shrink-0 md:block">
          <TypingBgmButton />
        </YeonView>
        {settingsControl ?? <ProductHeaderDefaultSettingsButton />}
        {profileControl ?? (
          <ProductHeaderProfileButton labels={profileLabels} />
        )}
      </YeonView>
    </YeonProductHeader>
  );
}

export function ProductHeaderDefaultSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <YeonView className="relative shrink-0">
      <ProductHeaderSettingsButton
        aria-label="설정"
        title="설정"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      />
      {open ? (
        <YeonView className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[#e5e5e5] bg-white p-3 text-[12px] leading-[1.5] text-[#666] shadow-lg">
          <YeonText variant="caption" tone="secondary">
            BGM은 헤더에서 바로 조절할 수 있습니다.
          </YeonText>
        </YeonView>
      ) : null}
    </YeonView>
  );
}

export function ProductHeaderProfileButton({
  href = "/profile",
  labels,
}: {
  href?: string;
  labels?: Partial<YeonProductProfileMenuLabels>;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  useEffect(() => {
    let cancelled = false;

    fetchIsAuthenticated()
      .then((nextIsAuthenticated) => {
        if (!cancelled) {
          setIsAuthenticated(nextIsAuthenticated);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <YeonProductProfileMenu
      href={href}
      isAuthenticated={isAuthenticated}
      isLoggingOut={isLoggingOut}
      labels={labels}
      onLogout={logout}
    />
  );
}
