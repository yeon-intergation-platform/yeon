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
  settingsControl?: ReactNode;
  profileControl?: ReactNode;
  rightExtras?: ReactNode;
};

const PRODUCT_HEADER_FRAME_CLASS =
  "h-[61px] border-b border-[#e5e5e5] bg-white px-6 py-3 md:px-12";
const PRODUCT_HEADER_INNER_BASE_CLASS = "mx-auto h-full max-w-[1400px]";
const PRODUCT_HEADER_INNER_DEFAULT_LAYOUT_CLASS =
  "flex items-center justify-between gap-3";

const COMMON_HEADER_NAV_ITEMS: Array<{
  key: Exclude<CommonServiceKey, "home">;
  label: string;
  href: string;
}> = [
  { key: "typing", label: "타자", href: "/typing-service" },
  { key: "card", label: "플래시카드", href: "/card-service" },
  { key: "community", label: "커뮤니티", href: "/community" },
];

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
        className="text-[22px] font-black tracking-[-0.04em] text-[#111] no-underline transition-opacity hover:opacity-70 md:text-[25px]"
      >
        YEON
      </Link>

      <div className="flex min-w-0 justify-center">
        <div className="flex max-w-full items-center gap-4 overflow-x-auto text-[14px] font-semibold text-[#111] md:gap-7 md:text-[16px]">
          {COMMON_HEADER_NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={activeService === item.key ? "page" : undefined}
              className={joinClassNames(
                "shrink-0 no-underline transition-opacity hover:opacity-70",
                activeService === item.key ? "font-black" : "font-medium"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        {rightExtras ? (
          <div className="hidden items-center gap-2 xl:flex">{rightExtras}</div>
        ) : null}
        <div className="hidden shrink-0 md:block">
          <TypingBgmButton showCredit={false} />
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
  href = "/counseling-service",
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
