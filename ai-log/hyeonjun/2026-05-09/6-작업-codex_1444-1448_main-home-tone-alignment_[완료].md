# 6-작업-codex*1444-1448_main-home-tone-alignment*[완료]

- 시작 시각: 2026-05-09 14:44 KST
- 종료 시각: 2026-05-09 14:48 KST
- 목표: 메인 페이지 디자인을 카드서비스/타자서비스 톤에 맞춰 화려한 요소를 제거하고 미니멀하게 정리한다.
- 범위: `apps/web` 루트 홈 UI, 관련 백로그/작업 로그 기록
- 참고 기준:
  - `apps/web/src/features/typing-service/typing-service-home.tsx`
  - `apps/web/src/features/card-service/card-service-home.tsx`
  - `docs/product/backlog/main-home-tone-alignment.md`
- 수행 내용:
  - 메인 페이지의 다크 그라디언트/도트 배경을 제거하고 흰 배경 + 얇은 보더 + 간결한 CTA 구조로 재작성.
  - 서비스 카드 정보를 status / audience / 진입 힌트 구조로 통일.
  - 상담 서비스는 로그인 진입, typing/card 서비스는 공개형 진입이라는 차이를 메인에서 바로 읽히게 정리.
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web build`
  - `git diff --check`
- 메모:
  - `apps/web/src/features/typing-service/characters/registry.generated.ts`는 작업 전부터 수정 상태였고, build 후에도 작업 전 상태로 복원해 이번 변경에 포함하지 않음.
