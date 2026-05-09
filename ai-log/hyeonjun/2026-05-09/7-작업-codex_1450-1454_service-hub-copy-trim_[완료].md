# 7-작업-codex*1450-1454_service-hub-copy-trim*[완료]

- 시작 시각: 2026-05-09 14:50 KST
- 종료 시각: 2026-05-09 14:54 KST
- 목표: 서비스 허브 첫 화면의 메타 설명성 문구를 제거하고 실제 서비스 목록 화면처럼 단순화한다.
- 범위: `apps/web/src/features/landing-home/landing-home.tsx`, backlog/ai-log 기록
- 수행 내용:
  - `YEON 서비스 허브` 라벨 제거
  - 상단 카피를 짧은 제목 + 한 줄 소개로 축소
  - 메타 설명 카드와 서비스 목록 보조 설명 제거
  - 서비스 카드에서 audience/진입 방식 설명을 제거하고 상태 + 요약 + 이동 문구만 유지
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web build`
  - `git diff --check`
- 메모:
  - `apps/web/src/features/typing-service/characters/registry.generated.ts`는 작업 전 상태로 복원해 이번 변경에 포함하지 않음.
