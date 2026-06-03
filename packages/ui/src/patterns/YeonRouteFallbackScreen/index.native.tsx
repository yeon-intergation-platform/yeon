import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import {
  YeonRouteLink,
  type YeonHref,
} from "../../runtime/YeonNavigation/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonRouteFallbackScreenProps = {
  href: YeonHref;
  linkLabel: string;
  title: string;
};

export function YeonRouteFallbackScreen({
  href,
  linkLabel,
  title,
}: YeonRouteFallbackScreenProps) {
  return (
    <YeonView style={styles.screen}>
      <YeonText style={styles.title}>{title}</YeonText>
      <YeonRouteLink href={href} style={styles.link}>
        {linkLabel}
      </YeonRouteLink>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  screen: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.background,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  link: {
    color: yeonMobileAppColors.accent,
    fontSize: 16,
    fontWeight: "800",
  },
});
