"use client";

import Link from "next/link";
import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { CircleUserRound, Settings } from "lucide-react";

import { TypingBgmButton } from "@/features/typing-service/typing-bgm-button";

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
        "flex items-center justify-center rounded-lg border border-[#e5e5e5] bg-white p-2 text-[#888] transition-colors hover:border-[#aaa] hover:text-[#111]",
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
  return (
    <Link
      href={href}
      aria-label="내정보"
      title="내정보"
      className="flex shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white p-2 text-[#888] no-underline transition-colors hover:border-[#aaa] hover:text-[#111]"
    >
      <CircleUserRound size={16} />
    </Link>
  );
}
