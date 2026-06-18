"use client";
import { useEffect, useState, type ReactNode } from "react";
import {
  YeonLink,
  YeonProductHeader,
  YeonProductHeaderActionButton,
  YeonProductProfileMenu,
  YeonText,
  YeonView,
  fetchYeon,
} from "@yeon/ui";
import { TypingBgmButton } from "@/features/typing-service/typing-bgm-button";
import { HeaderExperienceBadge } from "@/features/user-experience/header-experience-badge";
import { useLogout } from "@/lib/use-logout";

type CommonServiceKey = "home" | "typing" | "card" | "community";

type CommonProductHeaderProps = {
  activeService: CommonServiceKey;
  brandLabel?: string;
  settingsControl?: ReactNode;
  profileControl?: ReactNode;
  rightExtras?: ReactNode;
};

type AuthSessionPayload = {
  authenticated?: unknown;
};

const COMMON_HEADER_BRAND_LABELS: Record<CommonServiceKey, string> = {
  home: "YEON",
  typing: "YEON",
  card: "YEON",
  community: "YEON",
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
  brandLabel = COMMON_HEADER_BRAND_LABELS[activeService],
  settingsControl,
  profileControl,
  rightExtras,
}: CommonProductHeaderProps) {
  return (
    <YeonProductHeader
      as="nav"
      ariaLabel="YEON 공통 서비스 이동"
      innerClassName="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-6"
    >
      <YeonLink
        href="/"
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
          <HeaderExperienceBadge />
        </YeonView>
        <YeonView className="hidden shrink-0 md:block">
          <TypingBgmButton />
        </YeonView>
        {settingsControl ?? <ProductHeaderDefaultSettingsButton />}
        {profileControl ?? <ProductHeaderProfileButton />}
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
}: {
  href?: string;
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
      onLogout={logout}
    />
  );
}
