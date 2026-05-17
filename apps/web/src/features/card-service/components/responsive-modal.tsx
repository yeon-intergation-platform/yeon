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
}

export function ResponsiveModal({
  title,
  description,
  onClose,
  children,
  footer,
  widthClassName = "max-w-[880px]",
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
          <div className="flex items-start justify-between gap-4 border-b border-[#efefef] px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] md:px-6 md:py-5">
            <div className="min-w-0">
              <h2 className="text-[22px] font-semibold leading-tight text-[#111] md:text-[24px]">
                {title}
              </h2>
              {description ? (
                <p
                  className={`mt-2 ${SHARED_FEATURE_CLASS.text14Neutral} leading-6 md:text-[15px]`}
                >
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px] text-[#777] transition-colors hover:bg-[#f3f3f3] hover:text-[#111]"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-[#efefef] bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:py-4">
              {footer}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
