import { YeonImage } from "../../primitives/YeonImage/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";
import { createYeonInitials } from "../utils/create-yeon-initials";

export type YeonAvatarCircleTone = "accent" | "neutral";

export type YeonAvatarCircleProps = {
  imageUrl?: string | null;
  label: string;
  size?: number;
  tone?: YeonAvatarCircleTone;
};

export function YeonAvatarCircle({
  imageUrl,
  label,
  size = 48,
  tone = "accent",
}: YeonAvatarCircleProps) {
  const backgroundColor =
    tone === "accent"
      ? yeonMobileAppColors.accentSoft
      : yeonMobileAppColors.neutralSoft;
  const textColor =
    tone === "accent"
      ? yeonMobileAppColors.accent
      : yeonMobileAppColors.neutral;

  if (imageUrl) {
    return (
      <YeonImage
        source={{ uri: imageUrl }}
        style={{ borderRadius: size / 2, height: size, width: size }}
      />
    );
  }

  return (
    <YeonView
      style={[
        styles.avatar,
        { backgroundColor, borderRadius: size / 2, height: size, width: size },
      ]}
    >
      <YeonText
        variant="unstyled"
        tone="inherit"
        style={[styles.initials, { color: textColor }]}
      >
        {createYeonInitials(label)}
      </YeonText>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  avatar: {
    alignItems: "center",
    borderColor: yeonMobileAppColors.borderStrong,
    borderWidth: 1,
    justifyContent: "center",
  },
  initials: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
