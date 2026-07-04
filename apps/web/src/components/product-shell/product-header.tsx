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
import {
  PLATFORM_LANGUAGE_LABELS,
  PLATFORM_PROFILE_MENU_LABELS,
  PLATFORM_LANGUAGES,
  type PlatformLanguage,
} from "@/lib/platform-language";
import { usePlatformLanguage } from "@/lib/use-platform-language";
import { useLogout } from "@/lib/use-logout";

type CommonServiceKey =
  | "home"
  | "typing"
  | "card"
  | "community"
  | "game"
  | "todo";

// 서비스 키 → 내부 베이스 경로. SERVICE_SUBDOMAIN_ROUTES(subdomain-routing.ts)의
// servicePath와 같은 값이며, 좌상단 "한 단계 위" 네비게이션 계산에만 쓴다.
const SERVICE_BASE_PATH: Record<Exclude<CommonServiceKey, "home">, string> = {
  typing: "/typing-service",
  card: "/card-service",
  community: "/community",
  game: "/game-service",
  todo: "/todo-service",
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
  showBgmButton?: boolean;
  showSettingsButton?: boolean;
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
  todo: "YEON Today",
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
  showBgmButton = true,
  showSettingsButton = true,
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
        {showBgmButton ? (
          <YeonView className="hidden shrink-0 md:block">
            <TypingBgmButton />
          </YeonView>
        ) : null}
        {showSettingsButton
          ? (settingsControl ?? <ProductHeaderDefaultSettingsButton />)
          : settingsControl}
        {profileControl ?? (
          <ProductHeaderProfileButton labels={profileLabels} />
        )}
      </YeonView>
    </YeonProductHeader>
  );
}

export function ProductHeaderDefaultSettingsButton() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = usePlatformLanguage();
  const settingsLabel = language === "en" ? "Settings" : "설정";
  const languageLabel = language === "en" ? "Language" : "언어";
  const helpText =
    language === "en"
      ? "Game and profile screens use this language. Typing settings stay in sync."
      : "게임과 프로필 화면은 이 언어로 표시됩니다. 타자 설정도 함께 맞춥니다.";

  const handleLanguageChange = (nextLanguage: PlatformLanguage) => {
    setLanguage(nextLanguage);
    setOpen(false);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("lang", nextLanguage);
    window.location.assign(nextUrl.toString());
  };

  return (
    <YeonView className="relative shrink-0">
      <ProductHeaderSettingsButton
        aria-label={settingsLabel}
        title={settingsLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      />
      {open ? (
        <YeonView className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#e5e5e5] bg-white p-3 text-[12px] leading-[1.5] text-[#666] shadow-lg">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[11px] font-black text-[#111]"
          >
            {languageLabel}
          </YeonText>
          <YeonView className="mt-2 grid grid-cols-2 gap-1.5">
            {Object.values(PLATFORM_LANGUAGES).map((option) => {
              const isActive = language === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleLanguageChange(option)}
                  className={`rounded-lg border px-3 py-2 text-[12px] font-bold transition-colors ${
                    isActive
                      ? "border-[#111] bg-[#111] text-white"
                      : "border-[#e5e5e5] bg-white text-[#666] hover:border-[#111] hover:text-[#111]"
                  }`}
                >
                  {PLATFORM_LANGUAGE_LABELS[language][option]}
                </button>
              );
            })}
          </YeonView>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-2 text-[11px] leading-[1.6] text-[#666]"
          >
            {helpText}
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
  const { language } = usePlatformLanguage();
  const resolvedLabels = {
    ...PLATFORM_PROFILE_MENU_LABELS[language],
    ...labels,
  };

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
      labels={resolvedLabels}
      onLogout={logout}
    />
  );
}
