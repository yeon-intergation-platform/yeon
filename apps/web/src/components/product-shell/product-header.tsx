"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { CircleUserRound, LogOut, Settings, UserRound } from "lucide-react";

import { TypingBgmButton } from "@/features/typing-service/typing-bgm-button";
import { useLogout } from "@/lib/use-logout";

type ProductHeaderProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  as?: "header" | "nav";
  ariaLabel?: string;
};

type CommonServiceKey = "home" | "typing" | "card" | "community";

type CommonProductHeaderProps = {
  activeService: CommonServiceKey;
  brandLabel?: string;
  settingsControl?: ReactNode;
  profileControl?: ReactNode;
  rightExtras?: ReactNode;
};

const COMMON_HEADER_BRAND_LABELS: Record<CommonServiceKey, string> = {
  home: "YEON",
  typing: "YEON 타자연습",
  card: "YEON 카드",
  community: "YEON 커뮤니티",
} as const;

const PRODUCT_HEADER_FRAME_CLASS =
  "h-[61px] border-b border-[#e5e5e5] bg-white px-6 py-3 md:px-12";
const PRODUCT_HEADER_INNER_BASE_CLASS = "mx-auto h-full max-w-[1400px]";
const PRODUCT_HEADER_INNER_DEFAULT_LAYOUT_CLASS =
  "flex items-center justify-between gap-3";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ProductHeader({
  children,
  className,
  innerClassName,
  as = "header",
  ariaLabel,
}: ProductHeaderProps) {
  const frameClassName = joinClassNames(PRODUCT_HEADER_FRAME_CLASS, className);
  const content = (
    <div
      className={joinClassNames(
        PRODUCT_HEADER_INNER_BASE_CLASS,
        innerClassName ?? PRODUCT_HEADER_INNER_DEFAULT_LAYOUT_CLASS
      )}
    >
      {children}
    </div>
  );

  if (as === "nav") {
    return (
      <nav aria-label={ariaLabel} className={frameClassName}>
        {content}
      </nav>
    );
  }

  return <header className={frameClassName}>{content}</header>;
}

export function CommonProductHeader({
  activeService,
  brandLabel = COMMON_HEADER_BRAND_LABELS[activeService],
  settingsControl,
  profileControl,
  rightExtras,
}: CommonProductHeaderProps) {
  return (
    <ProductHeader
      as="nav"
      ariaLabel="YEON 공통 서비스 이동"
      innerClassName="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-6"
    >
      <Link
        href="/"
        aria-current={activeService === "home" ? "page" : undefined}
        className="min-w-0 text-[19px] font-black tracking-[-0.04em] text-[#111] no-underline transition-opacity hover:opacity-70 md:text-[23px]"
      >
        {brandLabel}
      </Link>

      <div aria-hidden="true" />

      <div className="flex min-w-0 items-center justify-end gap-2">
        {rightExtras ? (
          <div className="hidden items-center gap-2 xl:flex">{rightExtras}</div>
        ) : null}
        <div className="hidden shrink-0 md:block">
          <TypingBgmButton />
        </div>
        {settingsControl ?? <ProductHeaderDefaultSettingsButton />}
        {profileControl ?? <ProductHeaderProfileButton />}
      </div>
    </ProductHeader>
  );
}

export function ProductHeaderSettingsButton({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={joinClassNames(
        "flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white p-2 text-[#888] transition-colors hover:border-[#aaa] hover:text-[#111]",
        className
      )}
      {...props}
    >
      {children ?? <Settings size={15} />}
    </button>
  );
}

export function ProductHeaderDefaultSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <ProductHeaderSettingsButton
        aria-label="설정"
        title="설정"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      />
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[#e5e5e5] bg-white p-3 text-[12px] leading-[1.5] text-[#555] shadow-lg">
          BGM은 헤더에서 바로 조절할 수 있습니다.
        </div>
      ) : null}
    </div>
  );
}

export function ProductHeaderProfileButton({
  href = "/profile",
}: {
  href?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { logout, isLoggingOut } = useLogout();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="내정보 메뉴"
        title="내정보"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white p-2 text-[#888] transition-colors hover:border-[#aaa] hover:text-[#111]"
      >
        <CircleUserRound size={16} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="내정보 메뉴"
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white py-1 text-[13px] text-[#333] shadow-lg"
        >
          <Link
            href={href}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-[#333] no-underline transition-colors hover:bg-[#f7f7f7]"
            onClick={() => setOpen(false)}
          >
            <UserRound size={14} />
            내정보보기
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 border-0 bg-transparent px-3 py-2 text-left text-[13px] text-[#c2410c] transition-colors hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            disabled={isLoggingOut}
          >
            <LogOut size={14} />
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
