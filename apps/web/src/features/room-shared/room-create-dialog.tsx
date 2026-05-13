"use client";

import { useEffect, type FormEventHandler, type ReactNode } from "react";
import { X } from "lucide-react";

type RoomCreateDialogProps = {
  open: boolean;
  titleId: string;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  as?: "div" | "form";
  onSubmit?: FormEventHandler<HTMLFormElement>;
  closeDisabled?: boolean;
  panelClassName?: string;
  bodyClassName?: string;
};

const DEFAULT_PANEL_CLASS =
  "relative z-10 max-h-[calc(100vh-3rem)] w-full max-w-[560px] overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]";

export function RoomCreateDialog({
  open,
  titleId,
  title,
  description,
  closeLabel,
  onClose,
  children,
  as = "div",
  onSubmit,
  closeDisabled = false,
  panelClassName,
  bodyClassName = "p-5 md:p-6",
}: RoomCreateDialogProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || closeDisabled) return;
      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDisabled, onClose, open]);

  if (!open) return null;

  const content = (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-6 py-5">
        <div>
          <h2
            id={titleId}
            className="text-[22px] font-black tracking-[-0.04em] text-[#111]"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-[13px] font-medium leading-5 text-[#666]">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          disabled={closeDisabled}
          className="-mr-1 rounded-full p-1 text-[#444] transition-colors hover:bg-[#f5f5f5] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={28} strokeWidth={1.8} />
        </button>
      </div>
      <div className={bodyClassName}>{children}</div>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        disabled={closeDisabled}
        className="absolute inset-0 bg-[rgba(0,0,0,0.36)] disabled:cursor-not-allowed"
      />
      {as === "form" ? (
        <form
          onSubmit={onSubmit}
          className={panelClassName ?? DEFAULT_PANEL_CLASS}
        >
          {content}
        </form>
      ) : (
        <div className={panelClassName ?? DEFAULT_PANEL_CLASS}>{content}</div>
      )}
    </div>
  );
}
