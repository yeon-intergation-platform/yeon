import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-provider";
import { TypingServiceLayoutClient } from "./typing-service-layout-client";

export default function TypingServiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryProvider>
      <TypingServiceLayoutClient>{children}</TypingServiceLayoutClient>
    </QueryProvider>
  );
}
