import type { ReactNode } from "react";
import { useState } from "react";
import {
  YeonQueryClient as QueryClient,
  YeonQueryClientProvider as QueryClientProvider,
  YeonSafeAreaProvider as SafeAreaProvider,
  YeonStatusBar,
} from "@yeon/ui/native";
import { ChatServiceSessionProvider } from "./chat-service-session-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            retry: 1,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ChatServiceSessionProvider>{children}</ChatServiceSessionProvider>
        <YeonStatusBar tone="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
