# 게임 상세 라우트 metadata 커버리지 테스트

- 목표: 게임 상세 라우트의 정적 파라미터와 canonical metadata 회귀를 막는다.
- 변경:
  - `route-metadata.ts`로 JSX 없는 상세 SEO/JSON-LD 로직을 분리하고 `page.tsx`에서 Next export 조건에 맞게 래핑.
  - `apps/web/src/app/game-service/[gameSlug]/__tests__/page.test.ts` 추가.
  - static params 전체 slug, 상세 canonical metadata, missing slug 제목 반환을 검증.
  - `docs/product/backlog/2026-06-26-game-detail-route-metadata-coverage.md` 작성.
- 검증:
  - `pnpm --filter @yeon/web test -- 'src/app/game-service/[gameSlug]/__tests__/page.test.ts'`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `bash bin/verify-ssot.sh --project-only`
  - `git diff --check`
  - `pnpm --filter @yeon/web build`
- 상태: 완료.
