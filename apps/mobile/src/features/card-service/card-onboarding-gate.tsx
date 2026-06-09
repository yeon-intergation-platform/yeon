import { useYeonMutation as useMutation } from "@yeon/ui/native";
import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import {
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  showYeonAlert,
} from "@yeon/ui/native";
import { cardServiceApi } from "../../services/card-service/client";
import { getMobileApiBaseUrl } from "../../services/api-base-url";
import { writePrimaryAuthSessionToken } from "../../services/primary-auth/storage";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { getCardServiceErrorMessage } from "./error-message";
import {
  type MobileSocialProvider,
  startMobileSocialLogin,
} from "./social-login";
import {
  CardEmailLoginSheet,
  CardOnboardingDivider,
  CardOnboardingGuestAction,
  CardOnboardingHero,
  CardOnboardingSecondaryActions,
  CardOnboardingSocialButtons,
} from "./card-onboarding-gate-sections";

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
      showYeonAlert(
        CARD_SERVICE_TEXT.list.loginErrorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.list.loginErrorMessage
        )
      );
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
      showYeonAlert(
        CARD_SERVICE_TEXT.list.loginErrorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.list.loginErrorMessage
        )
      );
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
    } catch (error) {
      // idx-151: 브라우저 오픈 실패 시 사용자에게 안내한다.
      console.warn("[CardOnboardingGate] 회원가입 브라우저 오픈 실패", error);
      showYeonAlert(
        "브라우저 오픈 실패",
        "회원가입 페이지를 열 수 없습니다. 잠시 후 다시 시도해 주세요."
      );
    }
  }

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        <CardOnboardingHero />
        <CardOnboardingSocialButtons
          disabled={isBusy}
          onSocialLogin={(provider) => void handleSocialLogin(provider)}
          pendingProvider={socialPendingProvider}
        />
        <CardOnboardingDivider />
        <CardOnboardingSecondaryActions
          disabled={isBusy}
          onOpenEmailLogin={() => setEmailSheetOpen(true)}
          onOpenRegister={() => void handleOpenRegister()}
        />
        <CardOnboardingGuestAction
          disabled={isBusy}
          onContinue={() => void onContinueAsGuest()}
        />
      </FormStack>

      <CardEmailLoginSheet
        email={email}
        isPending={loginMutation.isPending}
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onClose={() => setEmailSheetOpen(false)}
        onSubmit={() => void handleEmailLogin()}
        password={password}
        visible={isEmailSheetOpen}
      />
    </MobileScreen>
  );
}
