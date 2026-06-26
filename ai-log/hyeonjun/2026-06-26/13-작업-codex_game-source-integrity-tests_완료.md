# 게임 source feed 병합 테스트

- 목표: 외부 feed 병합/상세 fallback/slug 순서 해석 경계를 테스트로 고정한다.
- 범위: `apps/web/src/features/game-service/__tests__/game-source.test.ts`, backlog/log 문서.
- 변경:
  - curated와 feed 병합 시 같은 slug 또는 embed 게임이 중복 노출되지 않는 경계를 테스트로 고정.
  - `getGamesBySlugs`가 입력 순서를 보존하고 없는 slug를 건너뛰는 경계를 테스트로 고정.
  - `getDetailGame`이 curated 게임은 feed 조회 없이 반환하고, feed fallback/없는 slug null 처리를 수행하는 경계를 테스트로 고정.
- 검증:
  - `pnpm --filter @yeon/web test -- src/features/game-service/__tests__/game-source.test.ts`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `bash bin/verify-ssot.sh --project-only`
  - `git diff --check`
- 상태: 완료.
