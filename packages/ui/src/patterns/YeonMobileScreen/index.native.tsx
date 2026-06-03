import type { ReactNode } from "react";

import {
  YeonKeyboardAvoidingView,
  type YeonKeyboardAvoidingViewProps,
} from "../../primitives/YeonKeyboardAvoidingView/index.native";
import {
  YeonSafeAreaView,
  type YeonSafeAreaViewProps,
} from "../../primitives/YeonSafeAreaView/index.native";
import {
  YeonScrollView,
  type YeonScrollViewProps,
} from "../../primitives/YeonScrollView/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import {
  createYeonStyleSheet,
  isYeonIOS,
  type YeonStyleProp,
  type YeonViewStyle,
} from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonMobileScreenContentVariant =
  | "card"
  | "centered"
  | "chat"
  | "detail"
  | "full"
  | "play";

export type YeonMobileScreenProps = {
  children: ReactNode;
  contentStyle?: YeonStyleProp<YeonViewStyle>;
  contentVariant?: YeonMobileScreenContentVariant;
  floatingSlot?: ReactNode;
  keyboardAvoiding?: boolean;
  keyboardShouldPersistTaps?: YeonScrollViewProps["keyboardShouldPersistTaps"];
  keyboardStyle?: YeonKeyboardAvoidingViewProps["style"];
  safeAreaEdges?: YeonSafeAreaViewProps["edges"];
  scroll?: boolean;
  style?: YeonScrollViewProps["style"] | YeonViewProps["style"];
};

export function YeonMobileScreen({
  children,
  contentStyle,
  contentVariant = "chat",
  floatingSlot,
  keyboardAvoiding = false,
  keyboardShouldPersistTaps,
  keyboardStyle,
  safeAreaEdges,
  scroll = true,
  style,
}: YeonMobileScreenProps) {
  const content = scroll ? (
    <YeonScrollView
      contentContainerStyle={[
        contentVariantStyles[contentVariant],
        contentStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      style={[styles.screen, style as YeonScrollViewProps["style"]]}
    >
      {children}
    </YeonScrollView>
  ) : (
    <YeonView style={[styles.screen, style as YeonViewProps["style"]]}>
      <YeonView style={[contentVariantStyles[contentVariant], contentStyle]}>
        {children}
      </YeonView>
    </YeonView>
  );

  const screen = safeAreaEdges ? (
    <YeonSafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      {content}
      {floatingSlot}
    </YeonSafeAreaView>
  ) : (
    <>
      {content}
      {floatingSlot}
    </>
  );

  if (!keyboardAvoiding) {
    return screen;
  }

  return (
    <YeonKeyboardAvoidingView
      behavior={isYeonIOS() ? "padding" : undefined}
      style={[styles.keyboard, keyboardStyle]}
    >
      {screen}
    </YeonKeyboardAvoidingView>
  );
}

const styles = createYeonStyleSheet({
  keyboard: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: yeonMobileAppColors.background,
    flex: 1,
  },
  screen: {
    backgroundColor: yeonMobileAppColors.background,
    flex: 1,
  },
  cardContent: {
    gap: 18,
    padding: 20,
    paddingBottom: 48,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 48,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  chatContent: {
    gap: 16,
    paddingBottom: 120,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  detailContent: {
    padding: 24,
    paddingBottom: 110,
  },
  fullContent: {
    flex: 1,
  },
  playContent: {
    flex: 1,
    padding: 24,
  },
});

const contentVariantStyles = {
  card: styles.cardContent,
  centered: styles.centeredContent,
  chat: styles.chatContent,
  detail: styles.detailContent,
  full: styles.fullContent,
  play: styles.playContent,
} as const;
