"use client";

import { useEffect, type ReactNode } from "react";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

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
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const isCompact = density === "compact";
  const headerClassName = isCompact
    ? "flex items-start justify-between gap-3 border-b border-[#efefef] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-5 md:py-3"
    : "flex items-start justify-between gap-4 border-b border-[#efefef] px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] md:px-6 md:py-5";
  const titleClassName = isCompact
    ? "text-[19px] font-semibold leading-tight text-[#111] md:text-[21px]"
    : "text-[22px] font-semibold leading-tight text-[#111] md:text-[24px]";
  const bodyClassName = isCompact
    ? "min-h-0 flex-1 overflow-y-auto px-4 py-3 md:px-5 md:py-4"
    : "min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6";
  const footerClassName = isCompact
    ? "border-t border-[#efefef] bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:px-5 md:py-3"
    : "border-t border-[#efefef] bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:py-4";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="모달 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(0,0,0,0.44)] backdrop-blur-[4px]"
      />
      <div className="relative flex h-full items-end justify-center md:items-center md:p-4">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative flex h-full w-full flex-col overflow-hidden bg-white md:h-auto md:max-h-[90vh] md:rounded-[28px] md:border md:border-[#e8e8e8] md:shadow-[0_24px_80px_rgba(0,0,0,0.18)] ${widthClassName}`}
        >
          <div className={headerClassName}>
            <div className="min-w-0">
              <h2 className={titleClassName}>{title}</h2>
              {description ? (
                <p
                  className={
                    isCompact
                      ? `mt-1 ${SHARED_FEATURE_CLASS.text14Neutral} truncate text-[13px] leading-5`
                      : `mt-2 ${SHARED_FEATURE_CLASS.text14Neutral} leading-6 md:text-[15px]`
                  }
                >
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={
                isCompact
                  ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[18px] text-[#777] transition-colors hover:bg-[#f3f3f3] hover:text-[#111]"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px] text-[#777] transition-colors hover:bg-[#f3f3f3] hover:text-[#111]"
              }
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div className={bodyClassName}>{children}</div>

          {footer ? <div className={footerClassName}>{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}
