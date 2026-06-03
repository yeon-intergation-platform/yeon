import { useYeonMutation as useMutation } from "@yeon/ui/native";
import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import {
  YeonActionButton as ActionButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonBrandIcon,
  YeonButton,
  YeonFormIntro as FormIntro,
  YeonFormStack as FormStack,
  YeonImage,
  YeonMobileScreen as MobileScreen,
  YeonText,
  YeonTextField as TextField,
  YeonView,
  createYeonStyleSheet,
  showYeonAlert,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import { cardServiceApi } from "../../services/card-service/client";
import { getMobileApiBaseUrl } from "../../services/api-base-url";
import { writePrimaryAuthSessionToken } from "../../services/primary-auth/storage";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  type MobileSocialProvider,
  startMobileSocialLogin,
} from "./social-login";

import mascotImage from "../../../assets/images/card-home/mascot-home.png";

// 카카오 브랜드 컬러(소셜 로그인 버튼 한정 예외 — 사용자 명시 요청).
const KAKAO_YELLOW = "#FEE500";
const KAKAO_LABEL_BLACK = "#191919";

type CardOnboardingGateProps = {
  // 로그인 성공 시 Spring 세션 토큰 전달(이메일/소셜 공통).
  onAuthenticated: (sessionToken: string) => void | Promise<void>;
  // 비회원으로 계속 — 게스트 모드로 홈 진입.
  onContinueAsGuest: () => void | Promise<void>;
};

// 첫 진입(또는 로그인 재진입) 게이트. 소셜 로그인 우선 레이아웃.
export function CardOnboardingGate({
  onAuthenticated,
  onContinueAsGuest,
}: CardOnboardingGateProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailSheetOpen, setEmailSheetOpen] = useState(false);
  const [socialPendingProvider, setSocialPendingProvider] =
    useState<MobileSocialProvider | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () =>
      cardServiceApi.loginWithCredential({
        email: email.trim(),
        password,
      }),
    onSuccess: async (response) => {
      await writePrimaryAuthSessionToken(response.sessionToken);
      setPassword("");
      setEmailSheetOpen(false);
      await onAuthenticated(response.sessionToken);
    },
  });

  const isBusy = loginMutation.isPending || socialPendingProvider !== null;

  async function handleEmailLogin() {
    try {
      await loginMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.list.loginErrorMessage;
      showYeonAlert(CARD_SERVICE_TEXT.list.loginErrorTitle, message);
    }
  }

  async function handleSocialLogin(provider: MobileSocialProvider) {
    if (isBusy) {
      return;
    }

    setSocialPendingProvider(provider);
    try {
      const result = await startMobileSocialLogin(provider);

      if (result.status === "success") {
        // 소셜 세션 토큰도 이메일 로그인과 동일한 Spring 세션 토큰 → 같은 저장 경로.
        await writePrimaryAuthSessionToken(result.sessionToken);
        await onAuthenticated(result.sessionToken);
        return;
      }

      if (result.status === "error") {
        showYeonAlert(CARD_SERVICE_TEXT.list.loginErrorTitle, result.message);
      }
      // cancelled: 사용자가 닫은 것이므로 조용히 무시.
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.list.loginErrorMessage;
      showYeonAlert(CARD_SERVICE_TEXT.list.loginErrorTitle, message);
    } finally {
      setSocialPendingProvider(null);
    }
  }

  async function handleOpenRegister() {
    // 모바일 전용 회원가입 엔드포인트가 없어 웹 회원가입 페이지를 연다.
    try {
      await WebBrowser.openBrowserAsync(
        `${getMobileApiBaseUrl()}/auth/register`
      );
    } catch {
      // 브라우저 오픈 실패는 조용히 무시.
    }
  }

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        {/* 웰컴 헤더: 마스코트 + 인사 + 부제 */}
        <YeonView style={styles.hero}>
          <YeonImage
            resizeMode="contain"
            source={mascotImage}
            style={styles.heroMascot}
          />
          <YeonText style={styles.heroTitle}>
            {CARD_SERVICE_TEXT.list.gateTitle}
          </YeonText>
          <YeonText style={styles.heroSubtitle}>
            {CARD_SERVICE_TEXT.list.gateSubtitle}
          </YeonText>
        </YeonView>

        {/* 소셜 로그인 우선 */}
        <YeonButton
          accessibilityRole="button"
          aria-label={CARD_SERVICE_TEXT.list.gateGoogleLabel}
          disabled={isBusy}
          onPress={() => handleSocialLogin("google")}
          style={styles.googleButton}
        >
          <YeonView style={styles.brandIconSlot}>
            <YeonBrandIcon name="google" size={22} tone="brand" />
          </YeonView>
          <YeonText style={styles.googleButtonText}>
            {socialPendingProvider === "google"
              ? CARD_SERVICE_TEXT.list.socialBusyLabel
              : CARD_SERVICE_TEXT.list.gateGoogleLabel}
          </YeonText>
        </YeonButton>

        <YeonButton
          accessibilityRole="button"
          aria-label={CARD_SERVICE_TEXT.list.gateKakaoLabel}
          disabled={isBusy}
          onPress={() => handleSocialLogin("kakao")}
          style={styles.kakaoButton}
        >
          <YeonView style={styles.brandIconSlot}>
            <YeonBrandIcon name="kakao" size={22} tone="brand" />
          </YeonView>
          <YeonText style={styles.kakaoButtonText}>
            {socialPendingProvider === "kakao"
              ? CARD_SERVICE_TEXT.list.socialBusyLabel
              : CARD_SERVICE_TEXT.list.gateKakaoLabel}
          </YeonText>
        </YeonButton>

        {/* 또는 */}
        <YeonView style={styles.divider}>
          <YeonView style={styles.dividerLine} />
          <YeonText style={styles.dividerLabel}>
            {CARD_SERVICE_TEXT.list.gateOrLabel}
          </YeonText>
          <YeonView style={styles.dividerLine} />
        </YeonView>

        {/* 이메일 로그인 / 회원가입 */}
        <YeonView style={styles.secondaryRow}>
          <YeonButton
            accessibilityRole="button"
            aria-label={CARD_SERVICE_TEXT.list.gateEmailLoginLabel}
            disabled={isBusy}
            onPress={() => setEmailSheetOpen(true)}
            style={styles.secondaryButton}
          >
            <YeonText style={styles.secondaryButtonText}>
              {CARD_SERVICE_TEXT.list.gateEmailLoginLabel}
            </YeonText>
          </YeonButton>
          <YeonButton
            accessibilityRole="button"
            aria-label={CARD_SERVICE_TEXT.list.gateRegisterLabel}
            disabled={isBusy}
            onPress={handleOpenRegister}
            style={styles.secondaryButton}
          >
            <YeonText style={styles.secondaryButtonText}>
              {CARD_SERVICE_TEXT.list.gateRegisterLabel}
            </YeonText>
          </YeonButton>
        </YeonView>

        {/* 게스트 안내 — 탭하면 비회원으로 계속 */}
        <YeonButton
          accessibilityRole="button"
          aria-label={CARD_SERVICE_TEXT.list.guestContinueLabel}
          disabled={isBusy}
          onPress={() => {
            void onContinueAsGuest();
          }}
          style={styles.guestNoteButton}
        >
          <YeonText style={styles.guestNoteText}>
            {CARD_SERVICE_TEXT.list.gateGuestNote}
          </YeonText>
        </YeonButton>
      </FormStack>

      {/* 이메일 로그인 바텀시트 */}
      <BottomSheetModal
        closeAccessibilityLabel="닫기"
        onClose={() => setEmailSheetOpen(false)}
        visible={isEmailSheetOpen}
      >
        <BottomSheetForm>
          <FormIntro title={CARD_SERVICE_TEXT.list.gateEmailSheetTitle} />
          <TextField
            keyboardType="email-address"
            label={CARD_SERVICE_TEXT.list.loginEmailLabel}
            onChangeText={setEmail}
            placeholder={CARD_SERVICE_TEXT.list.loginEmailPlaceholder}
            value={email}
          />
          <TextField
            label={CARD_SERVICE_TEXT.list.loginPasswordLabel}
            onChangeText={setPassword}
            placeholder={CARD_SERVICE_TEXT.list.loginPasswordPlaceholder}
            secureTextEntry
            value={password}
          />
          <ActionButton
            disabled={loginMutation.isPending || !email.trim() || !password}
            label={
              loginMutation.isPending
                ? CARD_SERVICE_TEXT.list.loginBusyLabel
                : CARD_SERVICE_TEXT.list.loginActionLabel
            }
            onPress={handleEmailLogin}
            variant="dark"
          />
        </BottomSheetForm>
      </BottomSheetModal>
    </MobileScreen>
  );
}

const BRAND_BUTTON_HEIGHT = 56;

const styles = createYeonStyleSheet({
  hero: {
    alignItems: "center",
    gap: 6,
    paddingTop: 28,
    paddingBottom: 8,
  },
  heroMascot: {
    height: 150,
    width: 150,
  },
  heroTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 40,
    marginTop: 12,
    paddingTop: 2,
    textAlign: "center",
  },
  heroSubtitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  // 소셜 버튼: 로고는 왼쪽 고정, 텍스트는 전체 폭 중앙.
  brandIconSlot: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 20,
    position: "absolute",
    top: 0,
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: yeonMobileAppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: BRAND_BUTTON_HEIGHT,
    justifyContent: "center",
  },
  googleButtonText: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  kakaoButton: {
    alignItems: "center",
    backgroundColor: KAKAO_YELLOW,
    borderRadius: 16,
    height: BRAND_BUTTON_HEIGHT,
    justifyContent: "center",
  },
  kakaoButtonText: {
    color: KAKAO_LABEL_BLACK,
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  dividerLine: {
    backgroundColor: yeonMobileAppColors.border,
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: yeonMobileAppColors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  guestNoteButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  guestNoteText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
