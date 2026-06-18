"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ElementType, ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonIcon } from "../../primitives/YeonIcon";
import { YeonLink } from "../../primitives/YeonLink";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import {
  useYeonBodyScrollLock,
  useYeonDocumentEvent,
  useYeonEscapeKey,
} from "../../hooks/YeonBrowserHooks";
import {
  YEON_WEB_OVERLAY_CLASS,
  YEON_WEB_SHADOW_CLASS,
} from "../../theme/web-style-tokens";
import type {
  YeonDocumentKeyboardEvent,
  YeonDocumentPointerEvent,
  YeonElement,
  YeonNode,
} from "../../types";
import { joinClassNames } from "../../utils";

export type YeonProductHeaderProps = {
  ariaLabel?: string;
  as?: ElementType;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export type YeonProductHeaderActionButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement>;

export type YeonServiceHelpFeature = {
  title: string;
  description: string;
};

export type YeonServiceHelpFaq = {
  question: string;
  answer: string;
};

export type YeonServiceHelpContent = {
  title: string;
  intro: readonly string[];
  features?: readonly YeonServiceHelpFeature[];
  faqs?: readonly YeonServiceHelpFaq[];
};

export type YeonServiceHelpDialogProps = {
  content: YeonServiceHelpContent;
};

export type YeonProductProfileMenuLabels = {
  button: string;
  profile: string;
  loggingOut: string;
  logout: string;
};

export type YeonProductProfileMenuProps = {
  href?: string;
  isAuthenticated: boolean;
  isLoggingOut?: boolean;
  labels?: Partial<YeonProductProfileMenuLabels>;
  onLogout: () => Promise<void> | void;
};

const PRODUCT_PROFILE_MENU_LABELS: YeonProductProfileMenuLabels = {
  button: "내정보 메뉴",
  profile: "내정보보기",
  loggingOut: "로그아웃 중...",
  logout: "로그아웃",
};

const PRODUCT_HEADER_FRAME_CLASS =
  "h-[61px] border-b border-[#e5e5e5] bg-white px-6 py-3 md:px-12";
const PRODUCT_HEADER_INNER_BASE_CLASS = "mx-auto h-full max-w-[1400px]";
const PRODUCT_HEADER_INNER_DEFAULT_LAYOUT_CLASS =
  "flex items-center justify-between gap-3";
const PRODUCT_HEADER_ACTION_BUTTON_CLASS =
  "flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white p-2 text-[#666] transition-colors hover:border-[#aaa] hover:text-[#111]";
const PRODUCT_PROFILE_MENU_ITEM_CLASS =
  "flex min-h-11 w-full !justify-start gap-2 !rounded-none !border-0 !bg-white !px-4 !py-0 text-left text-[13px] font-semibold leading-none !text-[#111] no-underline transition-colors hover:!bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60";

export function YeonProductHeader({
  ariaLabel,
  as = "header",
  children,
  className,
  innerClassName,
}: YeonProductHeaderProps) {
  return (
    <YeonView
      as={as}
      aria-label={ariaLabel}
      className={joinClassNames(PRODUCT_HEADER_FRAME_CLASS, className)}
    >
      <YeonView
        className={joinClassNames(
          PRODUCT_HEADER_INNER_BASE_CLASS,
          innerClassName ?? PRODUCT_HEADER_INNER_DEFAULT_LAYOUT_CLASS
        )}
      >
        {children}
      </YeonView>
    </YeonView>
  );
}

export function YeonProductHeaderActionButton({
  className,
  children,
  ...props
}: YeonProductHeaderActionButtonProps) {
  return (
    <YeonButton
      type="button"
      variant="icon"
      size="icon"
      className={joinClassNames(PRODUCT_HEADER_ACTION_BUTTON_CLASS, className)}
      {...props}
    >
      {children ?? <YeonIcon name="settings" size={15} />}
    </YeonButton>
  );
}

export function YeonProductProfileMenu({
  href = "/profile",
  isAuthenticated,
  isLoggingOut = false,
  labels,
  onLogout,
}: YeonProductProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<YeonElement | null>(null);
  const resolvedLabels = { ...PRODUCT_PROFILE_MENU_LABELS, ...labels };

  const handlePointerDown = useCallback((event: YeonDocumentPointerEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as YeonNode)
    ) {
      setOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: YeonDocumentKeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useYeonDocumentEvent("pointerdown", handlePointerDown, open);
  useYeonDocumentEvent("keydown", handleKeyDown, open);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <YeonView ref={menuRef} className="relative shrink-0">
      <YeonButton
        type="button"
        aria-label={resolvedLabels.button}
        title="내정보"
        aria-haspopup="menu"
        aria-expanded={open}
        variant="icon"
        size="icon"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white p-2 text-[#666] transition-colors hover:border-[#aaa] hover:text-[#111]"
      >
        <YeonIcon name="circle-user" size={16} />
      </YeonButton>

      {open ? (
        <YeonView
          role="menu"
          aria-label={resolvedLabels.button}
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white py-1 text-[13px] text-[#111] shadow-lg"
        >
          <YeonLink
            href={href}
            role="menuitem"
            className={PRODUCT_PROFILE_MENU_ITEM_CLASS}
            onClick={() => setOpen(false)}
          >
            <YeonIcon name="user" size={14} className="shrink-0" />
            {resolvedLabels.profile}
          </YeonLink>
          <YeonButton
            type="button"
            role="menuitem"
            variant="ghost"
            size="sm"
            className={PRODUCT_PROFILE_MENU_ITEM_CLASS}
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
            disabled={isLoggingOut}
          >
            <YeonIcon name="log-out" size={14} className="shrink-0" />
            {isLoggingOut ? resolvedLabels.loggingOut : resolvedLabels.logout}
          </YeonButton>
        </YeonView>
      ) : null}
    </YeonView>
  );
}

export function YeonServiceHelpDialog({ content }: YeonServiceHelpDialogProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useYeonEscapeKey(() => setOpen(false), open);
  useYeonBodyScrollLock(open);

  return (
    <>
      <YeonProductHeaderActionButton
        type="button"
        aria-label="도움말"
        title="도움말"
        onClick={() => setOpen(true)}
      >
        <YeonIcon name="circle-help" size={17} />
      </YeonProductHeaderActionButton>

      {open ? (
        <YeonView
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${YEON_WEB_OVERLAY_CLASS.scrimStrong}`}
          onClick={() => setOpen(false)}
        >
          <YeonView
            as="section"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`max-h-[min(720px,calc(100vh-32px))] w-[min(100%,720px)] overflow-hidden rounded-[28px] border border-[#e5e5e5] bg-white text-[#111] ${YEON_WEB_SHADOW_CLASS.dialog}`}
            onClick={(event) => event.stopPropagation()}
          >
            <YeonView className="service-help-scrollbar max-h-[min(720px,calc(100vh-32px))] overflow-y-auto px-6 py-6 pr-4 sm:px-8 sm:py-8 sm:pr-5">
              <YeonView className="flex items-start justify-between gap-4">
                <YeonView>
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="m-0 text-[12px] font-bold uppercase tracking-[0.18em] text-[#aaa]"
                  >
                    도움말
                  </YeonText>
                  <YeonText
                    as="h2"
                    id={titleId}
                    variant="unstyled"
                    tone="inherit"
                    className="mt-2 text-[24px] font-black leading-tight tracking-[-0.035em] text-[#111] sm:text-[30px]"
                  >
                    {content.title}
                  </YeonText>
                </YeonView>
                <YeonButton
                  type="button"
                  aria-label="도움말 닫기"
                  variant="icon"
                  size="icon"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[#666] transition-colors hover:border-[#aaa] hover:bg-white hover:text-[#111]"
                  onClick={() => setOpen(false)}
                >
                  <YeonIcon name="x" size={18} />
                </YeonButton>
              </YeonView>

              <YeonView className="mt-5 space-y-3 text-[15px] leading-7 text-[#666] [word-break:keep-all]">
                {content.intro.map((paragraph) => (
                  <YeonText
                    key={paragraph}
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="m-0"
                  >
                    {paragraph}
                  </YeonText>
                ))}
              </YeonView>

              {content.features && content.features.length > 0 ? (
                <YeonView className="mt-8 border-t border-[#e5e5e5] pt-6">
                  <YeonText
                    as="h3"
                    variant="unstyled"
                    tone="inherit"
                    className="text-[18px] font-black tracking-[-0.01em] text-[#111]"
                  >
                    주요 기능
                  </YeonText>
                  <YeonView as="ul" className="mt-4 grid gap-3 sm:grid-cols-2">
                    {content.features.map((feature) => (
                      <YeonView
                        as="li"
                        key={feature.title}
                        className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4"
                      >
                        <YeonText
                          as="p"
                          variant="unstyled"
                          tone="inherit"
                          className="flex items-start gap-2 text-[15px] font-bold text-[#111] [word-break:keep-all]"
                        >
                          <YeonView
                            as="span"
                            aria-hidden="true"
                            className="mt-[7px] h-[6px] w-[6px] flex-none rounded-full bg-[#111]"
                          />
                          {feature.title}
                        </YeonText>
                        <YeonText
                          as="p"
                          variant="unstyled"
                          tone="inherit"
                          className="mt-1 text-[14px] leading-6 text-[#666] [word-break:keep-all]"
                        >
                          {feature.description}
                        </YeonText>
                      </YeonView>
                    ))}
                  </YeonView>
                </YeonView>
              ) : null}

              {content.faqs && content.faqs.length > 0 ? (
                <YeonView className="mt-8 border-t border-[#e5e5e5] pt-6">
                  <YeonText
                    as="h3"
                    variant="unstyled"
                    tone="inherit"
                    className="text-[18px] font-black tracking-[-0.01em] text-[#111]"
                  >
                    자주 묻는 질문
                  </YeonText>
                  <YeonView className="mt-4 space-y-3">
                    {content.faqs.map((faq) => (
                      <YeonView
                        as="details"
                        key={faq.question}
                        className="group rounded-2xl border border-[#e5e5e5] [&[open]]:bg-[#fafafa]"
                      >
                        <YeonView
                          as="summary"
                          className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-[#111] [word-break:keep-all] [&::-webkit-details-marker]:hidden"
                        >
                          <YeonText as="span" variant="unstyled" tone="inherit">
                            {faq.question}
                          </YeonText>
                          <YeonText
                            as="span"
                            variant="unstyled"
                            tone="inherit"
                            aria-hidden="true"
                            className="flex-none text-[18px] leading-none text-[#aaa] transition-transform group-open:rotate-45"
                          >
                            +
                          </YeonText>
                        </YeonView>
                        <YeonText
                          as="p"
                          variant="unstyled"
                          tone="inherit"
                          className="px-4 pb-4 text-[14px] leading-6 text-[#666] [word-break:keep-all]"
                        >
                          {faq.answer}
                        </YeonText>
                      </YeonView>
                    ))}
                  </YeonView>
                </YeonView>
              ) : null}
            </YeonView>
          </YeonView>
        </YeonView>
      ) : null}
    </>
  );
}
