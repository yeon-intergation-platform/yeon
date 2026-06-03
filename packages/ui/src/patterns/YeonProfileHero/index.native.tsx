import type { ReactNode } from "react";

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

export type YeonProfileHeroProps = {
  avatarTone?: YeonAvatarCircleTone;
  highlight?: ReactNode;
  imageUrl?: string | null;
  label: string;
  meta?: ReactNode;
  size?: number;
  style?: YeonViewProps["style"];
  title: ReactNode;
};

export function YeonProfileHero({
  avatarTone = "neutral",
  highlight,
  imageUrl,
  label,
  meta,
  size = 72,
  style,
  title,
}: YeonProfileHeroProps) {
  return (
    <YeonView style={[styles.profileHero, style]}>
      <YeonAvatarCircle
        imageUrl={imageUrl}
        label={label}
        size={size}
        tone={avatarTone}
      />
      <YeonView style={styles.heroText}>
        <YeonText variant="unstyled" tone="inherit" style={styles.heroName}>
          {title}
        </YeonText>
        {meta ? (
          <YeonText variant="unstyled" tone="inherit" style={styles.heroMeta}>
            {meta}
          </YeonText>
        ) : null}
        {highlight ? (
          <YeonText
            variant="unstyled"
            tone="inherit"
            style={styles.heroHighlight}
          >
            {highlight}
          </YeonText>
        ) : null}
      </YeonView>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  heroHighlight: {
    color: yeonMobileAppColors.accent,
    fontSize: 15,
    fontWeight: "800",
  },
  heroMeta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
  },
  heroName: {
    color: yeonMobileAppColors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  heroText: {
    flex: 1,
    gap: 6,
  },
  profileHero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
});
