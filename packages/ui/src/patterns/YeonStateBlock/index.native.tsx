import { YeonSpinner } from "../../primitives/YeonSpinner/index.native";
import { YeonSurface } from "../../primitives/YeonSurface/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonStateBlockProps = {
  loading?: boolean;
  message: string;
  title: string;
};

export function YeonStateBlock({
  loading = false,
  message,
  title,
}: YeonStateBlockProps) {
  return (
    <YeonSurface style={styles.container}>
      {loading ? (
        <YeonSpinner color={yeonMobileAppColors.accent} size="small" />
      ) : null}
      <YeonText variant="subtitle" style={styles.title}>
        {title}
      </YeonText>
      <YeonText variant="body" tone="secondary" style={styles.message}>
        {message}
      </YeonText>
    </YeonSurface>
  );
}

const styles = createYeonStyleSheet({
  container: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 24,
    gap: 8,
    justifyContent: "center",
    minHeight: 180,
    padding: 20,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
