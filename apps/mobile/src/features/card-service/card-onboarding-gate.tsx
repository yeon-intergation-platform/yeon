import {
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
} from "@yeon/ui/native";
import {
  CardEmailLoginSheet,
  CardOnboardingDivider,
  CardOnboardingGuestAction,
  CardOnboardingHero,
  CardOnboardingSecondaryActions,
  CardOnboardingSocialButtons,
} from "./card-onboarding-gate-sections";
import { useCardOnboardingGateState } from "./use-card-onboarding-gate-state";

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
  const gate = useCardOnboardingGateState({ onAuthenticated });

  return (
    <MobileScreen contentVariant="card" safeAreaEdges={["top"]}>
      <FormStack gap="roomy">
        <CardOnboardingHero />
        <CardOnboardingSocialButtons
          disabled={gate.isBusy}
          onSocialLogin={(provider) => void gate.handleSocialLogin(provider)}
          pendingProvider={gate.socialPendingProvider}
        />
        <CardOnboardingDivider />
        <CardOnboardingSecondaryActions
          disabled={gate.isBusy}
          onOpenEmailLogin={() => gate.setEmailSheetOpen(true)}
          onOpenRegister={() => void gate.handleOpenRegister()}
        />
        <CardOnboardingGuestAction
          disabled={gate.isBusy}
          onContinue={() => void onContinueAsGuest()}
        />
      </FormStack>

      <CardEmailLoginSheet
        email={gate.email}
        isPending={gate.isEmailLoginPending}
        onChangeEmail={gate.setEmail}
        onChangePassword={gate.setPassword}
        onClose={() => gate.setEmailSheetOpen(false)}
        onSubmit={() => void gate.handleEmailLogin()}
        password={gate.password}
        visible={gate.isEmailSheetOpen}
      />
    </MobileScreen>
  );
}
