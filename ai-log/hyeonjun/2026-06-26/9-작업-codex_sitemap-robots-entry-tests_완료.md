# sitemap/robots 엔트리포인트 커버리지 테스트

- 목표: `x-forwarded-host` 기반 sitemap/robots 분기 연결부가 깨지는 회귀를 막는다.
- 변경:
  - `apps/web/src/app/__tests__/sitemap-robots.test.ts` 추가.
  - game host sitemap 반환, robots sitemap 안내, unknown host noindex 동작을 검증.
  - `docs/product/backlog/2026-06-26-sitemap-robots-entrypoint-coverage.md` 작성.
- 검증:
  - `pnpm --filter @yeon/web test -- src/app/__tests__/sitemap-robots.test.ts`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `bash bin/verify-ssot.sh --project-only`
  - `git diff --check`
- 상태: 완료.
