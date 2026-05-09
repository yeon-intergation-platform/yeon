"use client";

import Link from "next/link";
import type { ReactNode } from "react";
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

export function TypingServiceHeader({
  active,
  title = "YEON 타자연습",
  controls,
}: TypingServiceHeaderProps) {
  return (
    <header className="h-[76px] border-b border-[#e5e5e5] bg-white px-6 md:px-10">
      <div className="flex h-full items-center justify-between gap-5">
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={PLATFORM_HOME_HREF}
            className="text-[22px] font-black tracking-[-0.04em] text-[#111] no-underline transition-opacity hover:opacity-70 md:text-[25px]"
          >
            YEON
          </Link>
          <Link
            href="/typing-service"
            className="shrink-0 text-[20px] font-black tracking-[-0.04em] text-[#111] no-underline transition-opacity hover:opacity-70 md:text-[25px]"
          >
            {title}
          </Link>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-5">
          <nav
            aria-label="타자 서비스 이동"
            className="flex items-center gap-5 overflow-x-auto text-[15px] font-semibold text-[#111] md:gap-8 md:text-[17px]"
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

          {controls ? (
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              {controls}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
