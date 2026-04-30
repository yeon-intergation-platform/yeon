import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-provider";

export default function TypingServiceLayout({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
