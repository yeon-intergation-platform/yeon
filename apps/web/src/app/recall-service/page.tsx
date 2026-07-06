import { BaekjiMockHome } from "@/features/typing-service/baekji-mock-home";

// 백지 학습(blurt.yeon.world) 서비스 홈. 타자와 분리된 독립 서비스 경로(/recall-service).
// 현재는 정적 mock 데이터 기반 목업이며, 타자 셸/레이아웃 상수/@yeon/ui 프리미티브를 재사용한다.
export default function RecallServicePage() {
  return <BaekjiMockHome />;
}
