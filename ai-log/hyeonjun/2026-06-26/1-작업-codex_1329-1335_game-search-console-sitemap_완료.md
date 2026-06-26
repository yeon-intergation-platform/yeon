# 게임 허브 Search Console sitemap 대상 정합성

## 목표

- 사용자가 제시한 게임 상세 29개 URL이 운영 sitemap에 포함되는지 확인한다.
- `game.yeon.world` sitemap이 Search Console 제출 자동화 대상에 포함되는지 확인하고, 빠진 경우 정합화한다.

## 확인 근거

- `https://game.yeon.world/sitemap.xml` 운영 응답 기준 29개 요청 URL 모두 포함, 총 `<loc>` 30개(홈 1개 + 상세 29개).
- `https://game.yeon.world/robots.txt`가 `Sitemap: https://game.yeon.world/sitemap.xml`을 노출한다.
- 기존 `apps/web/scripts/submit-search-console-sitemaps.mjs`와 `docs/seo/google-search-console.md`에는 `game.yeon.world` 제출 대상이 빠져 있었다.

## 작업

- Search Console 제출 대상에 `game.yeon.world` sitemap을 추가한다.
- 운영 문서의 제출 대상과 URL 검사 대표 항목에 게임 호스트를 추가한다.

## 검증

- `curl -fsSL https://game.yeon.world/sitemap.xml` 기반 대조: 요청 상세 URL 29개 모두 포함, 누락 0개.
- `pnpm --filter @yeon/web search-console:sitemaps`: dry-run 대상에 `https://game.yeon.world/sitemap.xml` 포함.
- `git diff --check`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
