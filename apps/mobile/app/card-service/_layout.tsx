import {
  YeonMobileScreen as MobileScreen,
  YeonStack as Stack,
  YeonStateBlock as StateBlock,
} from "@yeon/ui/native";
import { CARD_SERVICE_TEXT } from "../../src/features/card-service/card-service-copy";
import { CardOnboardingGate } from "../../src/features/card-service/card-onboarding-gate";
import {
  CardSessionProvider,
  useCardSession,
} from "../../src/features/card-service/card-session-context";

// 게이트 게이팅을 레이아웃 레벨에서 처리 → 게이트 중에는 하단 탭을 숨긴다.
function CardServiceNavigator() {
  const { phase, authenticate, continueAsGuest } = useCardSession();

  if (phase === "booting") {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.bootLoadingMessage}
          title={CARD_SERVICE_TEXT.state.bootLoadingTitle}
        />
      </MobileScreen>
    );
  }

  if (phase === "gate") {
    return (
      <CardOnboardingGate
        onAuthenticated={authenticate}
        onContinueAsGuest={continueAsGuest}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="decks/[deckId]" />
      <Stack.Screen name="decks/[deckId]/play" />
      <Stack.Screen name="rooms/[roomId]" />
    </Stack>
  );
}

export default function CardServiceLayout() {
  return (
    <CardSessionProvider>
      <CardServiceNavigator />
    </CardSessionProvider>
  );
}
