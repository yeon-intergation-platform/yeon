import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";
import { YeonAvatarCircle } from "../YeonAvatarCircle/index.native";

export type YeonProfileListRowProps = {
  avatarSize?: number;
  imageUrl?: string | null;
  label: string;
  meta?: ReactNode;
  onPress: YeonButtonProps["onPress"];
  preview?: ReactNode;
  style?: YeonViewProps["style"];
  title: ReactNode;
  titleTone?: "accent" | "primary";
  trailingSlot?: ReactNode;
};

export function YeonProfileListRow({
  avatarSize = 48,
  imageUrl,
  label,
  meta,
  onPress,
  preview,
  style,
  title,
  titleTone = "accent",
  trailingSlot,
}: YeonProfileListRowProps) {
  return (
    <YeonView style={[styles.row, style]}>
      <YeonButton onPress={onPress} style={styles.profileRow} variant="ghost">
        <YeonAvatarCircle imageUrl={imageUrl} label={label} size={avatarSize} />
        <YeonView style={styles.textColumn}>
          <YeonText
            variant="unstyled"
            tone="inherit"
            style={[
              styles.title,
              titleTone === "primary" ? styles.titlePrimary : null,
            ]}
          >
            {title}
          </YeonText>
          {meta ? (
            <YeonText variant="unstyled" tone="inherit" style={styles.meta}>
              {meta}
            </YeonText>
          ) : null}
          {preview ? (
            <YeonText variant="unstyled" tone="inherit" style={styles.preview}>
              {preview}
            </YeonText>
          ) : null}
        </YeonView>
      </YeonButton>
      {trailingSlot ? (
        <YeonView style={styles.trailing}>{trailingSlot}</YeonView>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  meta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  preview: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
  },
  profileRow: {
    alignItems: "center",
    borderWidth: 0,
    flex: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-start",
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: yeonMobileAppColors.accent,
    fontSize: 18,
    fontWeight: "900",
  },
  titlePrimary: {
    color: yeonMobileAppColors.text,
  },
  trailing: {
    alignItems: "flex-end",
    gap: 8,
    marginLeft: 12,
  },
});
