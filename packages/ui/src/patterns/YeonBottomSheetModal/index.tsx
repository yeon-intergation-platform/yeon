import type { CSSProperties, ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonModal } from "../../primitives/YeonModal";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonBottomSheetModalVisibilityProps = {
  visible: boolean;
  onClose: () => void;
};

export type YeonBottomSheetModalContentProps = {
  children: ReactNode;
  closeAccessibilityLabel: string;
};

export type YeonBottomSheetModalStyleProps = {
  className?: string;
  keyboardStyle?: CSSProperties;
  sheetClassName?: string;
  sheetStyle?: CSSProperties;
};

export type YeonBottomSheetModalProps = YeonBottomSheetModalVisibilityProps &
  YeonBottomSheetModalContentProps &
  YeonBottomSheetModalStyleProps;

export function YeonBottomSheetModal({
  children,
  className,
  closeAccessibilityLabel,
  keyboardStyle,
  onClose,
  sheetClassName,
  sheetStyle,
  visible,
}: YeonBottomSheetModalProps) {
  return (
    <YeonModal onRequestClose={onClose} transparent visible={visible}>
      <YeonView
        className={joinClassNames(
          "fixed inset-0 z-50 flex items-end justify-center",
          className
        )}
        style={keyboardStyle}
      >
        <YeonButton
          aria-label={closeAccessibilityLabel}
          className="absolute inset-0 bg-[#111]/20"
          onClick={onClose}
          variant="ghost"
        />
        <YeonView
          className={joinClassNames(
            "relative max-h-[88dvh] w-full rounded-t-[28px] bg-white px-6 pt-[18px]",
            sheetClassName
          )}
          style={sheetStyle}
        >
          <span className="mx-auto block h-[6px] w-[66px] rounded-full bg-[#e5e5e5]" />
          {children}
        </YeonView>
      </YeonView>
    </YeonModal>
  );
}
