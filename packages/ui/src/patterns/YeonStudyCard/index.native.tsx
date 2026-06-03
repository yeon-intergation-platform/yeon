import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonScrollView } from "../../primitives/YeonScrollView/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonStudyCardProps = {
  accessibilityLabel: string;
  body: ReactNode;
  hint?: ReactNode;
  label: ReactNode;
  onPress: YeonButtonProps["onPress"];
  style?: YeonButtonProps["style"];
};

export function YeonStudyCard({
  accessibilityLabel,
  body,
  hint,
  label,
  onPress,
  style,
}: YeonStudyCardProps) {
  return (
    <YeonButton
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      variant="secondary"
      style={[styles.card, style]}
    >
      <YeonText variant="unstyled" tone="inherit" style={styles.label}>
        {label}
      </YeonText>
      {/* idx=138: scrollEnabled={false}로 ScrollView가 제스처를 소비하지 않게 하고
          부모 YeonButton의 onPress만 탭을 처리한다. 본문이 실제로 잘릴 수 있을 때는
          카드 탭 인터랙션과 스크롤 영역을 분리하는 방향으로 리팩토링 권장. */}
      <YeonScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
      >
        {typeof body === "string" ? (
          <YeonText variant="unstyled" tone="inherit" style={styles.body}>
            {body}
          </YeonText>
        ) : (
          <YeonView style={styles.bodyContent}>{body}</YeonView>
        )}
      </YeonScrollView>
      {hint ? (
        <YeonText variant="unstyled" tone="inherit" style={styles.hint}>
          {hint}
        </YeonText>
      ) : null}
    </YeonButton>
  );
}

const styles = createYeonStyleSheet({
  body: {
    color: yeonMobileAppColors.text,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 34,
    marginTop: 20,
    textAlign: "left",
  },
  bodyContent: {
    marginTop: 20,
  },
  card: {
    borderColor: yeonMobileAppColors.borderStrong,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: "column",
    padding: 24,
  },
  hint: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    marginTop: 18,
    textAlign: "center",
  },
  label: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
