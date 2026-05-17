import { Redirect } from "expo-router";

import { isCardApp } from "../src/lib/mobile-app-mode";
import { useChatServiceSession } from "../src/providers/chat-service-session-provider";

export default function IndexRoute() {
  if (isCardApp) {
    return <Redirect href="/card-service" />;
  }

  const { status } = useChatServiceSession();

  if (status === "signed_in") {
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Redirect href="/(auth)" />;
}
