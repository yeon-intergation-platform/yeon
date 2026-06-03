import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonDeckListItemProps = {
  accessibilityLabel: string;
  actionLabel: ReactNode;
  description?: ReactNode;
  meta: ReactNode;
  onPress: NonNullable<YeonButtonProps["onPress"]>;
  title: ReactNode;
};

export function YeonDeckListItem({
  accessibilityLabel,
  actionLabel,
  description,
  meta,
  onPress,
  title,
}: YeonDeckListItemProps) {
  return (
    <YeonButton
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      variant="secondary"
      style={styles.card}
    >
      <YeonView style={styles.content}>
        <YeonText variant="unstyled" tone="inherit" style={styles.title}>
          {title}
        </YeonText>
        <YeonText variant="unstyled" tone="inherit" style={styles.meta}>
          {meta}
        </YeonText>
        {description ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            style={styles.description}
          >
            {description}
          </YeonText>
        ) : null}
      </YeonView>
      <YeonText variant="unstyled" tone="inherit" style={styles.action}>
        {actionLabel}
      </YeonText>
    </YeonButton>
  );
}

const styles = createYeonStyleSheet({
  action: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  card: {
    alignItems: "flex-start",
    backgroundColor: yeonMobileAppColors.white,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "column",
    gap: 10,
    padding: 18,
  },
  content: {
    alignSelf: "stretch",
  },
  description: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  meta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    marginTop: 5,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 17,
    fontWeight: "900",
  },
});
