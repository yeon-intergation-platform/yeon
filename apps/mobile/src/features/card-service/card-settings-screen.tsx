import {
  YeonActionButton as ActionButton,
  YeonButton,
  YeonFormStack as FormStack,
  YeonIcon,
  YeonMobileScreen as MobileScreen,
  YeonSectionCard as SectionCard,
  YeonText,
  YeonView,
  createYeonStyleSheet,
  showYeonAlert,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import { ProfileExperienceSection } from "../user-experience/profile-experience-section";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { useCardSession } from "./card-session-context";

// 설정 탭: 계정 상태 + 로그아웃(여기에만 노출).
export function CardSettingsScreen() {
  const { isSignedIn, logout, openGate } = useCardSession();

  function handleLogout() {
    showYeonAlert(
      CARD_SERVICE_TEXT.settings.logoutConfirmTitle,
      CARD_SERVICE_TEXT.settings.logoutConfirmMessage,
      [
        { text: CARD_SERVICE_TEXT.shared.closeLabel, style: "cancel" },
        {
          text: CARD_SERVICE_TEXT.settings.logoutLabel,
          style: "destructive",
          onPress: () => {
            void logout();
          },
        },
      ]
    );
  }

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        <YeonView style={styles.header}>
          <YeonText style={styles.title}>
            {CARD_SERVICE_TEXT.settings.title}
          </YeonText>
        </YeonView>

        {/* 계정 */}
        <YeonView style={styles.section}>
          <YeonText style={styles.sectionTitle}>
            {CARD_SERVICE_TEXT.settings.accountSectionTitle}
          </YeonText>
          <SectionCard style={styles.accountCard}>
            <YeonText style={styles.accountStatus}>
              {isSignedIn
                ? CARD_SERVICE_TEXT.settings.statusSignedIn
                : CARD_SERVICE_TEXT.settings.statusGuest}
            </YeonText>
            {isSignedIn ? (
              <YeonButton
                accessibilityRole="button"
                aria-label={CARD_SERVICE_TEXT.settings.logoutLabel}
                onPress={handleLogout}
                style={styles.logoutRow}
              >
                <YeonIcon
                  color={yeonMobileAppColors.textMuted}
                  name="log-out"
                  size={18}
                />
                <YeonText style={styles.logoutText}>
                  {CARD_SERVICE_TEXT.settings.logoutLabel}
                </YeonText>
              </YeonButton>
            ) : (
              <ActionButton
                label={CARD_SERVICE_TEXT.settings.loginToSyncLabel}
                onPress={openGate}
                style={styles.loginButton}
                variant="dark"
              />
            )}
          </SectionCard>
        </YeonView>

        {/* 경험치/레벨: 로그인 시에만 패널 + 적립 이력 노출(웹 프로필과 동일 표시). */}
        <ProfileExperienceSection />
      </FormStack>
    </MobileScreen>
  );
}

const styles = createYeonStyleSheet({
  header: {
    marginTop: 28,
    paddingTop: 4,
  },
  title: {
    color: yeonMobileAppColors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  accountCard: {
    gap: 14,
    padding: 16,
  },
  accountStatus: {
    color: yeonMobileAppColors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 12,
  },
  logoutText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  loginButton: {
    alignItems: "center",
  },
});
