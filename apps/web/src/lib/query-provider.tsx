"use client";
import {
  YeonQueryClient,
  YeonQueryClientProvider,
} from "@yeon/ui/runtime/YeonQuery";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useState } from "react";

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
} as const;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new YeonQueryClient(queryClientOptions));

  return (
    <YeonQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </YeonQueryClientProvider>
  );
}
