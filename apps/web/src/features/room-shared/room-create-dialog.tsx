"use client";
import type { ReactNode } from "react";
import {
  YeonButton,
  YeonIcon,
  YeonForm,
  YeonModal,
  YeonText,
  YeonView,
  YEON_WEB_SHADOW_CLASS,
  type YeonFormEventHandler,
  type YeonFormElement,
} from "@yeon/ui";
import {
  useYeonBodyScrollLock,
  useYeonEscapeKey,
} from "@yeon/ui/hooks/YeonBrowserHooks";

type RoomCreateDialogProps = {
  open: boolean;
  titleId: string;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  as?: "div" | "form";
  onSubmit?: YeonFormEventHandler<YeonFormElement>;
  closeDisabled?: boolean;
  panelClassName?: string;
  bodyClassName?: string;
};

const DEFAULT_PANEL_CLASS = `relative z-10 max-h-[calc(100vh-3rem)] w-full max-w-[560px] overflow-y-auto rounded-[28px] bg-white ${YEON_WEB_SHADOW_CLASS.popover}`;

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
  useYeonBodyScrollLock(open);
  useYeonEscapeKey(() => {
    if (closeDisabled) return;
    onClose();
  }, open);

  if (!open) return null;

  const content = (
    <>
      <YeonView className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-6 py-5">
        <YeonView>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            id={titleId}
            className="text-[22px] font-black tracking-[-0.04em] text-[#111]"
          >
            {title}
          </YeonText>
          {description ? (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[13px] font-medium leading-5 text-[#666]"
            >
              {description}
            </YeonText>
          ) : null}
        </YeonView>
        <YeonButton
          type="button"
          variant="icon"
          size="icon"
          onClick={onClose}
          aria-label={closeLabel}
          disabled={closeDisabled}
          className="-mr-1 rounded-full p-1 text-[#666] hover:bg-[#fafafa] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <YeonIcon name="x" size={28} strokeWidth={1.8} />
        </YeonButton>
      </YeonView>
      <YeonView className={bodyClassName}>{children}</YeonView>
    </>
  );

  return (
    <YeonModal
      visible={open}
      onRequestClose={closeDisabled ? undefined : onClose}
      aria-labelledby={titleId}
      className="fixed inset-0 z-[80] m-0 flex h-auto max-h-none w-auto max-w-none items-center justify-center border-0 bg-transparent px-4 py-6"
    >
      <YeonButton
        type="button"
        variant="ghost"
        aria-label={closeLabel}
        onClick={onClose}
        disabled={closeDisabled}
        className="absolute inset-0 h-auto w-auto rounded-none bg-[#111]/40 p-0 hover:bg-[#111]/40 disabled:cursor-not-allowed"
      />
      {as === "form" ? (
        <YeonForm
          onSubmit={onSubmit}
          className={panelClassName ?? DEFAULT_PANEL_CLASS}
        >
          {content}
        </YeonForm>
      ) : (
        <YeonView className={panelClassName ?? DEFAULT_PANEL_CLASS}>
          {content}
        </YeonView>
      )}
    </YeonModal>
  );
}
