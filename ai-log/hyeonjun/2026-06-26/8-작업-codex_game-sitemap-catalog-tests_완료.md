# 게임 sitemap 카탈로그 커버리지 테스트

- 목표: 게임 카탈로그 slug가 `game.yeon.world` sitemap에서 누락되는 회귀를 자동으로 잡는다.
- 변경:
  - `apps/web/src/lib/__tests__/seo.test.ts`에 game host sitemap 전체 slug 포함 검증 추가.
  - `docs/product/backlog/2026-06-26-game-sitemap-catalog-coverage.md` 작성.
- 검증:
  - `pnpm --filter @yeon/web test -- src/lib/__tests__/seo.test.ts`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `bash bin/verify-ssot.sh --project-only`
  - `git diff --check`
- 상태: 완료.
