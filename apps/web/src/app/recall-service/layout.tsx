import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-provider";

// 백지 학습 서비스 레이아웃. 재사용하는 타자 헤더가 React Query 훅에 의존하므로
// QueryProvider로 감싼다(타자 서비스 레이아웃과 동일한 provider).
export default function RecallServiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
