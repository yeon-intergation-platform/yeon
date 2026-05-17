import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

import { AppLaunchScreen } from "../src/components/branding/app-launch-screen";
import { isCardApp } from "../src/lib/mobile-app-mode";
import { MOBILE_WEB_PREVIEW } from "../src/lib/mobile-preview";
import { AppProviders } from "../src/providers/app-providers";
import { useChatServiceSession } from "../src/providers/chat-service-session-provider";

const MIN_LAUNCH_SCREEN_MS = 1200;

function MobileWebFrame({ children }: { children: React.ReactNode }) {
  const isWeb = Platform.OS === "web";

  if (!isWeb) {
    return children;
  }

  const { width, height } = useWindowDimensions();
  const scale = Math.min(
    width / MOBILE_WEB_PREVIEW.width,
    height / MOBILE_WEB_PREVIEW.height,
    MOBILE_WEB_PREVIEW.transform.scaleMax
  );
  const previewWidth = MOBILE_WEB_PREVIEW.width * scale;
  const previewHeight = MOBILE_WEB_PREVIEW.height * scale;

  return (
    <View style={[styles.webRoot, { width, height }]}>
      <View
        style={[
          styles.webFrame,
          {
            width: previewWidth,
            height: previewHeight,
          },
        ]}
      >
        <View
          style={[
            styles.webSafeArea,
            { width: previewWidth, height: previewHeight },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

function RootNavigator() {
  const { status } = useChatServiceSession();
  const [isLaunchDelayDone, setIsLaunchDelayDone] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLaunchDelayDone(true);
    }, MIN_LAUNCH_SCREEN_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (!isLaunchDelayDone || status === "booting") {
    return <AppLaunchScreen />;
  }

  if (isCardApp) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="card-service" />
        <Stack.Screen name="card-service/decks/[deckId]" />
        <Stack.Screen name="card-service/decks/[deckId]/play" />
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
      <Stack.Screen name="card-service/decks/[deckId]" />
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

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MOBILE_WEB_PREVIEW.style.containerBackground,
    padding: MOBILE_WEB_PREVIEW.style.padding,
    // web-only 배경 여백 영역: 모바일 프리뷰와 동일한 뷰포트 중앙 정렬을 위해 숫자 기반 패딩 사용
  },
  webFrame: {
    overflow: "hidden",
    borderRadius: MOBILE_WEB_PREVIEW.style.frameRadius,
    borderWidth: MOBILE_WEB_PREVIEW.style.frameBorderWidth,
    borderColor: MOBILE_WEB_PREVIEW.style.frameBorderColor,
    backgroundColor: MOBILE_WEB_PREVIEW.style.frameBackground,
  },
  webSafeArea: {
    backgroundColor: MOBILE_WEB_PREVIEW.style.frameBackground,
    overflow: "hidden",
  },
});
