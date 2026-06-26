# 게임 catalog 정합성 테스트

- 목표: 게임 catalog 값이 줄거나 깨져 sitemap/detail 노출이 조용히 망가지는 회귀를 막는다.
- 범위: `apps/web/src/features/game-service/__tests__/game-catalog.test.ts`, backlog/log 문서.
- 변경:
  - 정적 sitemap 대상 게임 29개 유지 조건을 테스트로 고정.
  - slug URL 형식, 제목/요약/설명/provider/controls 비어 있음과 trim 깨짐을 테스트로 고정.
  - embed 식별자 중복 방지를 테스트로 고정.
- 검증:
  - `pnpm --filter @yeon/web test -- src/features/game-service/__tests__/game-catalog.test.ts`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `bash bin/verify-ssot.sh --project-only`
  - `git diff --check`
- 상태: 완료.
