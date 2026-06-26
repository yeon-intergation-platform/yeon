# 운영누락 보강 50개 태스크 1차 묶음

- 목표: 50개 운영누락 보강 태스크 중 첫 묶음을 실제 테스트/문서로 진행한다.
- 범위: 게임 catalog/feed 불변식 테스트, 50개 태스크 장부, 작업 로그.
- 완료 예정:
  - 01~12: 게임 catalog region/collection/tab/tag 경계 테스트.
  - 13~25: GameMonetize feed category/entity/slug/schema/운영 상수 경계 테스트.
- 변경:
  - `docs/product/backlog/2026-06-26-ops-hardening-50-task-ledger.md`에 50개 태스크 장부 작성.
  - 01~25번을 완료 처리.
  - `game-catalog.test.ts`에 region/collection/tab/tag 운영 불변식 테스트 추가.
  - `game-feed.test.ts`에 category/entity/slug/schema/limit/revalidate 운영 불변식 테스트 추가.
- 검증:
  - `pnpm --filter @yeon/web test -- src/features/game-service/__tests__/game-catalog.test.ts src/features/game-service/__tests__/game-feed.test.ts`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `bash bin/verify-ssot.sh --project-only`
  - `git diff --check`
- 상태: 완료.
