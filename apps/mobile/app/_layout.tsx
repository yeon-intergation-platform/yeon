import "../global.css";
import {
  YeonMobileWebFrame as MobileWebFrame,
  clearYeonTimeout,
  scheduleYeonTimeout,
} from "@yeon/ui/native";
import { YeonStack as Stack } from "@yeon/ui/native";
import { useEffect, useState } from "react";
import { AppLaunchScreen } from "../src/components/branding/app-launch-screen";
import { isCardApp } from "../src/lib/mobile-app-mode";
import { AppProviders } from "../src/providers/app-providers";
import { useChatServiceSession } from "../src/providers/chat-service-session-provider";

const MIN_LAUNCH_SCREEN_MS = 1200;

function RootNavigator() {
  const { status } = useChatServiceSession();
  const [isLaunchDelayDone, setIsLaunchDelayDone] = useState(false);

  useEffect(() => {
    const timeout = scheduleYeonTimeout(() => {
      setIsLaunchDelayDone(true);
    }, MIN_LAUNCH_SCREEN_MS);

    return () => {
      clearYeonTimeout(timeout);
    };
  }, []);

  if (!isLaunchDelayDone || status === "booting") {
    return <AppLaunchScreen />;
  }

  if (isCardApp) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        {/* card-service는 자체 _layout(하단 탭 + 게이트)을 소유한다. */}
        <Stack.Screen name="card-service" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="life-os" />
      <Stack.Screen name="card-service" />
      <Stack.Screen name="chat/[roomId]" />
      <Stack.Screen name="profile/[profileId]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <MobileWebFrame>
        <RootNavigator />
      </MobileWebFrame>
    </AppProviders>
  );
}
