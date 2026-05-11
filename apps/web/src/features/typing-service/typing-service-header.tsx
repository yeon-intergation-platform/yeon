"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ProductHeader } from "@/components/product-shell/product-header";
import { PLATFORM_HOME_HREF } from "@/lib/platform-services";

export type TypingServiceNavKey = "home" | "rooms" | "decks" | "race";

type TypingServiceHeaderProps = {
  active: TypingServiceNavKey;
  title?: string;
  controls?: ReactNode;
};

const NAV_ITEMS: { key: TypingServiceNavKey; label: string; href: string }[] = [
  { key: "home", label: "타자연습 홈", href: "/typing-service" },
  { key: "rooms", label: "타자방", href: "/typing-service/rooms" },
  { key: "decks", label: "연습 덱", href: "/typing-service/decks" },
  { key: "race", label: "레이스", href: "/typing-service/play" },
];

function normalizeHeaderTitle(title: string) {
  return title.replace(/^YEON\s*/, "").trim();
}

export function TypingServiceHeader({
  active,
  title = "타자연습",
  controls,
}: TypingServiceHeaderProps) {
  const displayTitle = normalizeHeaderTitle(title);

  return (
    <ProductHeader innerClassName="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={PLATFORM_HOME_HREF}
          className="text-[22px] font-black tracking-[-0.04em] text-[#111] no-underline transition-opacity hover:opacity-70 md:text-[25px]"
        >
          YEON
        </Link>
        {displayTitle ? (
          <Link
            href="/typing-service"
            className="hidden min-w-0 truncate text-[18px] font-black tracking-[-0.04em] text-[#111] no-underline transition-opacity hover:opacity-70 sm:block md:text-[22px]"
          >
            {displayTitle}
          </Link>
        ) : null}
      </div>

      <nav
        aria-label="타자 서비스 이동"
        className="flex min-w-0 items-center justify-center gap-5 overflow-x-auto text-[15px] font-semibold text-[#111] md:gap-8 md:text-[17px]"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active === item.key ? "page" : undefined}
            className={`shrink-0 no-underline transition-opacity hover:opacity-70 ${
              active === item.key ? "font-black" : "font-medium"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex min-w-0 items-center justify-end gap-2">
        {controls ? (
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {controls}
          </div>
        ) : null}
      </div>
    </ProductHeader>
  );
}
