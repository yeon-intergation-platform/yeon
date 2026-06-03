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
import {
  YeonAvatarCircle,
  type YeonAvatarCircleTone,
} from "../YeonAvatarCircle/index.native";

export type YeonPostAuthorHeaderProps = {
  avatarSize?: number;
  avatarTone?: YeonAvatarCircleTone;
  imageUrl?: string | null;
  label: string;
  meta?: ReactNode;
  onPress: YeonButtonProps["onPress"];
  style?: YeonViewProps["style"];
  title: ReactNode;
  titleSize?: "md" | "lg";
  trailingLayout?: "column" | "row";
  trailingSlot?: ReactNode;
  verticalAlign?: "center" | "start";
};

export function YeonPostAuthorHeader({
  avatarSize = 42,
  avatarTone = "accent",
  imageUrl,
  label,
  meta,
  onPress,
  style,
  title,
  titleSize = "md",
  trailingLayout = "row",
  trailingSlot,
  verticalAlign = "start",
}: YeonPostAuthorHeaderProps) {
  return (
    <YeonView
      style={[
        styles.header,
        verticalAlign === "center" ? styles.headerCenter : null,
        style,
      ]}
    >
      <YeonButton onPress={onPress} style={styles.authorRow} variant="ghost">
        <YeonAvatarCircle
          imageUrl={imageUrl}
          label={label}
          size={avatarSize}
          tone={avatarTone}
        />
        <YeonView style={styles.authorMeta}>
          <YeonText
            variant="unstyled"
            tone="inherit"
            style={[
              styles.authorName,
              titleSize === "lg" ? styles.authorNameLarge : null,
            ]}
          >
            {title}
          </YeonText>
          {meta ? (
            <YeonText
              variant="unstyled"
              tone="inherit"
              style={styles.authorSub}
            >
              {meta}
            </YeonText>
          ) : null}
        </YeonView>
      </YeonButton>
      {trailingSlot ? (
        <YeonView
          style={[
            styles.trailing,
            trailingLayout === "column" ? styles.trailingColumn : null,
          ]}
        >
          {trailingSlot}
        </YeonView>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  authorMeta: {
    flexShrink: 1,
    gap: 4,
  },
  authorName: {
    color: yeonMobileAppColors.accent,
    fontSize: 18,
    fontWeight: "900",
  },
  authorNameLarge: {
    fontSize: 20,
  },
  authorRow: {
    alignItems: "center",
    borderWidth: 0,
    flexDirection: "row",
    flexShrink: 1,
    gap: 12,
    justifyContent: "flex-start",
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  authorSub: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerCenter: {
    alignItems: "center",
    marginBottom: 14,
  },
  trailing: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 12,
  },
  trailingColumn: {
    alignItems: "flex-end",
    flexDirection: "column",
    gap: 8,
  },
});
