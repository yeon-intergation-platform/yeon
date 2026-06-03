import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonScrollView } from "../../primitives/YeonScrollView/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonReviewPanelActionTone = "primary" | "secondary";

export type YeonReviewPanelAction = {
  accessibilityLabel?: string;
  disabled?: boolean;
  label: ReactNode;
  onPress: YeonButtonProps["onPress"];
  tone?: YeonReviewPanelActionTone;
};

export type YeonReviewPanelProps = {
  actions: YeonReviewPanelAction[];
  answerLabel: ReactNode;
  answerText: ReactNode;
  questionLabel: ReactNode;
  questionText: ReactNode;
  style?: YeonViewProps["style"];
};

export function YeonReviewPanel({
  actions,
  answerLabel,
  answerText,
  questionLabel,
  questionText,
  style,
}: YeonReviewPanelProps) {
  return (
    <YeonView style={[styles.panel, style]}>
      <YeonScrollView contentContainerStyle={styles.scrollContent}>
        <YeonText variant="unstyled" tone="inherit" style={styles.label}>
          {questionLabel}
        </YeonText>
        <YeonView style={styles.questionBox}>
          {typeof questionText === "string" ||
          typeof questionText === "number" ? (
            <YeonText
              variant="unstyled"
              tone="inherit"
              style={styles.questionText}
            >
              {String(questionText)}
            </YeonText>
          ) : (
            questionText
          )}
        </YeonView>
        <YeonText
          variant="unstyled"
          tone="inherit"
          style={[styles.label, styles.answerLabel]}
        >
          {answerLabel}
        </YeonText>
        <YeonView style={styles.answerBox}>
          {typeof answerText === "string" || typeof answerText === "number" ? (
            <YeonText
              variant="unstyled"
              tone="inherit"
              style={styles.answerText}
            >
              {String(answerText)}
            </YeonText>
          ) : (
            answerText
          )}
        </YeonView>
      </YeonScrollView>
      <YeonView style={styles.actions}>
        {actions.map((action, index) => {
          const isPrimary = action.tone === "primary";

          return (
            <YeonButton
              accessibilityLabel={action.accessibilityLabel}
              disabled={action.disabled}
              key={index}
              onPress={action.onPress}
              variant={isPrimary ? "primary" : "secondary"}
              style={[
                styles.actionButton,
                isPrimary
                  ? styles.actionButtonPrimary
                  : styles.actionButtonSecondary,
                action.disabled ? styles.actionButtonDisabled : null,
              ]}
            >
              <YeonText
                variant="unstyled"
                tone="inherit"
                style={[
                  styles.actionText,
                  isPrimary ? styles.actionTextPrimary : null,
                ]}
              >
                {action.label}
              </YeonText>
            </YeonButton>
          );
        })}
      </YeonView>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  actionButton: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 54,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonPrimary: {
    backgroundColor: yeonMobileAppColors.black,
  },
  actionButtonSecondary: {
    backgroundColor: yeonMobileAppColors.white,
    borderColor: yeonMobileAppColors.borderStrong,
    borderWidth: 1,
  },
  actionText: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  actionTextPrimary: {
    color: yeonMobileAppColors.white,
  },
  actions: {
    gap: 10,
    marginTop: 14,
  },
  answerBox: {
    backgroundColor: yeonMobileAppColors.black,
    borderRadius: 16,
    marginTop: 8,
    padding: 18,
  },
  answerText: {
    color: yeonMobileAppColors.white,
    fontSize: 16,
    lineHeight: 28,
  },
  answerLabel: {
    marginTop: 24,
  },
  label: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  panel: {
    borderColor: yeonMobileAppColors.borderStrong,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    padding: 18,
  },
  questionBox: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    padding: 18,
  },
  questionText: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    lineHeight: 28,
  },
  scrollContent: {
    paddingBottom: 8,
  },
});
