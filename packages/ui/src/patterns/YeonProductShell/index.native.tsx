import { useState } from "react";
import type { ReactNode } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonIcon } from "../../primitives/YeonIcon/index.native";
import { YeonModal } from "../../primitives/YeonModal/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors, yeonMobileAppShadow } from "../../theme";

export type YeonProductHeaderProps = {
  ariaLabel?: string;
  as?: unknown;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  style?: YeonViewProps["style"];
};

export type YeonProductHeaderActionButtonProps = Omit<
  YeonButtonProps,
  "onPress"
> & {
  "aria-label"?: string;
  className?: string;
  onClick?: () => void;
  onPress?: YeonButtonProps["onPress"];
  title?: string;
};

export type YeonServiceHelpFeature = {
  title: string;
  description: string;
};

export type YeonServiceHelpFaq = {
  question: string;
  answer: string;
};

export type YeonServiceHelpContent = {
  title: string;
  intro: readonly string[];
  features?: readonly YeonServiceHelpFeature[];
  faqs?: readonly YeonServiceHelpFaq[];
};

export type YeonServiceHelpDialogProps = {
  content: YeonServiceHelpContent;
};

export type YeonProductProfileMenuLabels = {
  button: string;
  profile: string;
  loggingOut: string;
  logout: string;
};

export type YeonProductProfileMenuProps = {
  href?: string;
  isAuthenticated: boolean;
  isLoggingOut?: boolean;
  labels?: Partial<YeonProductProfileMenuLabels>;
  onLogout: () => Promise<void> | void;
};

const PRODUCT_PROFILE_MENU_LABELS: YeonProductProfileMenuLabels = {
  button: "내정보 메뉴",
  profile: "내정보보기",
  loggingOut: "로그아웃 중...",
  logout: "로그아웃",
};

export function YeonProductHeader({
  ariaLabel,
  children,
  style,
}: YeonProductHeaderProps) {
  return (
    <YeonView accessibilityLabel={ariaLabel} style={[styles.header, style]}>
      <YeonView style={styles.headerInner}>{children}</YeonView>
    </YeonView>
  );
}

export function YeonProductProfileMenu({
  isAuthenticated,
  isLoggingOut = false,
  labels,
  onLogout,
}: YeonProductProfileMenuProps) {
  const resolvedLabels = { ...PRODUCT_PROFILE_MENU_LABELS, ...labels };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <YeonView
      accessibilityLabel={resolvedLabels.button}
      style={styles.profileMenu}
    >
      <YeonButton size="sm" style={styles.profileButton} variant="secondary">
        <YeonIcon name="user" size={14} />
        <YeonText variant="caption" style={styles.profileButtonText}>
          {resolvedLabels.profile}
        </YeonText>
      </YeonButton>
      <YeonButton
        disabled={isLoggingOut}
        onPress={() => {
          void onLogout();
        }}
        size="sm"
        style={styles.profileButton}
        variant="secondary"
      >
        <YeonIcon name="log-out" size={14} />
        <YeonText variant="caption" style={styles.profileButtonText}>
          {isLoggingOut ? resolvedLabels.loggingOut : resolvedLabels.logout}
        </YeonText>
      </YeonButton>
    </YeonView>
  );
}

export function YeonProductHeaderActionButton({
  "aria-label": ariaLabel,
  accessibilityLabel,
  children,
  onClick,
  onPress,
  style,
  title,
  ...props
}: YeonProductHeaderActionButtonProps) {
  return (
    <YeonButton
      accessibilityLabel={accessibilityLabel ?? ariaLabel ?? title}
      onPress={onPress ?? onClick}
      size="sm"
      style={[styles.actionButton, style]}
      variant="secondary"
      {...props}
    >
      {children ?? <YeonIcon name="settings" size={16} />}
    </YeonButton>
  );
}

export function YeonServiceHelpDialog({ content }: YeonServiceHelpDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <YeonProductHeaderActionButton
        aria-label="도움말"
        title="도움말"
        onClick={() => setOpen(true)}
      >
        <YeonIcon name="circle-help" size={17} />
      </YeonProductHeaderActionButton>
      <YeonModal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <YeonView style={styles.modalBackdrop}>
          <YeonView style={styles.modalCard}>
            <YeonView style={styles.modalHeader}>
              <YeonView style={styles.titleStack}>
                <YeonText
                  variant="caption"
                  tone="secondary"
                  style={styles.eyebrow}
                >
                  도움말
                </YeonText>
                <YeonText variant="title" style={styles.title}>
                  {content.title}
                </YeonText>
              </YeonView>
              <YeonButton
                accessibilityLabel="도움말 닫기"
                onPress={() => setOpen(false)}
                size="sm"
                style={styles.closeButton}
                variant="secondary"
              >
                <YeonIcon name="x" size={18} />
              </YeonButton>
            </YeonView>
            <YeonView style={styles.bodyStack}>
              {content.intro.map((paragraph) => (
                <YeonText
                  key={paragraph}
                  variant="body"
                  tone="secondary"
                  style={styles.paragraph}
                >
                  {paragraph}
                </YeonText>
              ))}
              {content.features?.map((feature) => (
                <YeonView key={feature.title} style={styles.infoCard}>
                  <YeonText variant="label" style={styles.infoTitle}>
                    {feature.title}
                  </YeonText>
                  <YeonText
                    variant="caption"
                    tone="secondary"
                    style={styles.infoText}
                  >
                    {feature.description}
                  </YeonText>
                </YeonView>
              ))}
              {content.faqs?.map((faq) => (
                <YeonView key={faq.question} style={styles.infoCard}>
                  <YeonText variant="label" style={styles.infoTitle}>
                    {faq.question}
                  </YeonText>
                  <YeonText
                    variant="caption"
                    tone="secondary"
                    style={styles.infoText}
                  >
                    {faq.answer}
                  </YeonText>
                </YeonView>
              ))}
            </YeonView>
          </YeonView>
        </YeonView>
      </YeonModal>
    </>
  );
}

const styles = createYeonStyleSheet({
  actionButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    minWidth: 44,
    paddingHorizontal: 10,
  },
  bodyStack: {
    gap: 12,
    marginTop: 18,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  header: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderBottomColor: yeonMobileAppColors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerInner: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCard: {
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  infoText: {
    lineHeight: 20,
  },
  infoTitle: {
    color: yeonMobileAppColors.text,
    fontWeight: "800",
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.backdrop,
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    ...yeonMobileAppShadow,
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 28,
    borderWidth: 1,
    maxWidth: 720,
    padding: 22,
    width: "100%",
  },
  modalHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  paragraph: {
    lineHeight: 22,
  },
  profileButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  profileButtonText: {
    color: yeonMobileAppColors.text,
    fontWeight: "700",
  },
  profileMenu: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  title: {
    fontSize: 26,
    letterSpacing: -0.8,
  },
  titleStack: {
    flex: 1,
    gap: 8,
  },
});
