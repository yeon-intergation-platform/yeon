import type { ReactNode } from "react";

import { YeonButton } from "../../primitives/YeonButton/index.native";
import {
  YeonKeyboardAvoidingView,
  type YeonKeyboardAvoidingViewProps,
} from "../../primitives/YeonKeyboardAvoidingView/index.native";
import { YeonModal } from "../../primitives/YeonModal/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import {
  createYeonStyleSheet,
  isYeonIOS,
  yeonAbsoluteFillObject,
} from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonBottomSheetModalProps = {
  children: ReactNode;
  closeAccessibilityLabel: string;
  keyboardStyle?: YeonKeyboardAvoidingViewProps["style"];
  onClose: () => void;
  sheetStyle?: YeonViewProps["style"];
  visible: boolean;
};

export function YeonBottomSheetModal({
  children,
  closeAccessibilityLabel,
  keyboardStyle,
  onClose,
  sheetStyle,
  visible,
}: YeonBottomSheetModalProps) {
  return (
    <YeonModal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <YeonKeyboardAvoidingView
        behavior={isYeonIOS() ? "padding" : undefined}
        style={[styles.modalRoot, keyboardStyle]}
      >
        <YeonButton
          accessibilityLabel={closeAccessibilityLabel}
          onPress={onClose}
          variant="ghost"
          style={styles.backdrop}
        />
        <YeonView style={[styles.sheet, sheetStyle]}>
          <YeonView style={styles.sheetHandle} />
          {children}
        </YeonView>
      </YeonKeyboardAvoidingView>
    </YeonModal>
  );
}

const styles = createYeonStyleSheet({
  backdrop: {
    ...yeonAbsoluteFillObject,
    backgroundColor: yeonMobileAppColors.backdrop,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: yeonMobileAppColors.borderStrong,
    borderRadius: 999,
    height: 6,
    width: 66,
  },
});
