"use client";
import type { ReactNode } from "react";
import {
  YeonButton,
  YeonModal,
  YeonView,
  YeonText,
  YEON_WEB_SHADOW_CLASS,
} from "@yeon/ui";
import {
  useYeonBodyScrollLock,
  useYeonEscapeKey,
} from "@yeon/ui/hooks/YeonBrowserHooks";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

interface ResponsiveModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  density?: "default" | "compact";
}

export function ResponsiveModal({
  title,
  description,
  onClose,
  children,
  footer,
  widthClassName = "max-w-[880px]",
  density = "default",
}: ResponsiveModalProps) {
  useYeonBodyScrollLock();
  useYeonEscapeKey(onClose);

  const isCompact = density === "compact";
  const headerClassName = isCompact
    ? "flex items-start justify-between gap-3 border-b border-[#e5e5e5] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-5 md:py-3"
    : "flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] md:px-6 md:py-5";
  const titleClassName = isCompact
    ? "text-[19px] font-semibold leading-tight text-[#111] md:text-[21px]"
    : "text-[22px] font-semibold leading-tight text-[#111] md:text-[24px]";
  const bodyClassName = isCompact
    ? "min-h-0 flex-1 overflow-y-auto px-4 py-3 md:px-5 md:py-4"
    : "min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6";
  const footerClassName = isCompact
    ? "border-t border-[#e5e5e5] bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:px-5 md:py-3"
    : "border-t border-[#e5e5e5] bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:py-4";

  return (
    <YeonModal
      visible
      onRequestClose={onClose}
      aria-label={title}
      className="fixed inset-0 z-50 m-0 h-auto max-h-none w-auto max-w-none border-0 bg-transparent p-0"
    >
      <YeonButton
        type="button"
        aria-label="모달 닫기"
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute inset-0 h-auto w-auto rounded-none bg-[#111]/40 p-0 backdrop-blur-[4px] hover:bg-[#111]/40"
      />
      <YeonView className="relative flex h-full items-end justify-center md:items-center md:p-4">
        <YeonView
          as="section"
          className={`relative flex h-full w-full flex-col overflow-hidden bg-white md:h-auto md:max-h-[90vh] md:rounded-[28px] md:border md:border-[#e5e5e5] ${YEON_WEB_SHADOW_CLASS.modalMd} ${widthClassName}`}
        >
          <YeonView className={headerClassName}>
            <YeonView className="min-w-0">
              <YeonText
                as="h2"
                variant="unstyled"
                tone="inherit"
                className={titleClassName}
              >
                {title}
              </YeonText>
              {description ? (
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className={
                    isCompact
                      ? `mt-1 ${SHARED_FEATURE_CLASS.text14Neutral} truncate text-[13px] leading-5`
                      : `mt-2 ${SHARED_FEATURE_CLASS.text14Neutral} leading-6 md:text-[15px]`
                  }
                >
                  {description}
                </YeonText>
              ) : null}
            </YeonView>
            <YeonButton
              type="button"
              onClick={onClose}
              variant="icon"
              size="icon"
              className={
                isCompact
                  ? "h-8 w-8 shrink-0 rounded-lg text-[18px]"
                  : "h-10 w-10 shrink-0 rounded-xl text-[20px]"
              }
              aria-label="닫기"
            >
              ✕
            </YeonButton>
          </YeonView>

          <YeonView className={bodyClassName}>{children}</YeonView>

          {footer ? (
            <YeonView className={footerClassName}>{footer}</YeonView>
          ) : null}
        </YeonView>
      </YeonView>
    </YeonModal>
  );
}
