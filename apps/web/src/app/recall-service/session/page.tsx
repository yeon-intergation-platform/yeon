import { BaekjiSession } from "@/features/typing-service/baekji-session";

// 백지 "안 보고 쓰기" 세션 화면. 라우트 /recall-service/session (= blurt.yeon.world/session).
// recall-service/layout.tsx의 QueryProvider를 상속한다(재사용 타자 훅이 React Query에 의존).
export default function RecallSessionPage() {
  return <BaekjiSession />;
}
