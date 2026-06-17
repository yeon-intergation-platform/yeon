# 공개 콘텐츠 SEO와 structured data 보강

- 시작: 19:26
- 작업 워크트리: `yeon-4`
- 브랜치: `feat/public-content-seo-structured-20260617`
- 목표: 공개 콘텐츠 500단계 12차 276~300을 구현한다.
- 범위: support/news/blog canonical/metadata/sitemap/robots/structured data/Search Console 정책 보강.
- 검증 예정: public-content data/structured-data/seo 테스트, public-content audit, web typecheck/lint/build, SSOT 검사.
- 종료: 19:30

## 결과

- `PUBLIC_CONTENT_CANONICAL_URLS`로 support/news/blog canonical host를 SEO 유틸에 명시했다.
- robots 공통 제외 경로에 `/admin/`, `/api/`, `/auth/`, `/preview/`를 포함했다.
- support/news/blog 정적 `opengraph-image` route를 추가했다.
- 공개 콘텐츠 home, collection, article metadata에 채널 기본 OG image와 Twitter `summary_large_image`를 연결했다.
- Article 계열 JSON-LD에 채널 기본 OG image를 포함했다.
- 500단계 원장 276~300을 완료 처리했다.

## 검증

- 통과: `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/lib/__tests__/seo.test.ts`
- 통과: `pnpm --filter @yeon/web public-content:audit`
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web build`
- 통과: `git diff --check`
- 통과: `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- 통과: `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
