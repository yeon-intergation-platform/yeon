import { BaekjiHome } from "@/features/typing-service/baekji-home";

// 백지 학습(blurt.yeon.world) 서비스 홈. 타자와 분리된 독립 서비스 경로(/recall-service).
// 카드 서비스 덱 목록을 재사용해 "질문 보고 답 쓰기" 세션 진입점을 제공한다.
export default function RecallServicePage() {
  return <BaekjiHome />;
}
