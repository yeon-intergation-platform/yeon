# 12-작업-codex_1433-1437_public-content-collection-pages

## 범위

- 브랜치: `feat/public-content-collection-pages-20260617`
- 목적: 500단계 계획의 정보 구조/런타임/SEO 항목 중 공개 콘텐츠 중간 collection URL을 구현한다.
- 제외: 상담관리/상담 워크스페이스. 동결 정책에 따라 검증 범위에 포함하지 않는다.
- 제외: admin 본문 수정/삭제. 초기 정책에 따라 운영 관제와 공개 URL 보강만 진행한다.

## 코드/문서 근거

- `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`
- `docs/product/backlog/2026-06-17-public-content-collection-pages.md`
- `apps/web/src/features/public-content/public-content-data.ts`
- `apps/web/src/features/public-content/public-content-ui.tsx`
- `apps/web/src/lib/seo.ts`
- `apps/web/e2e/public-content-smoke.spec.ts`

## 변경 예정

- 공개 콘텐츠 collection resolver 추가
- collection 페이지 metadata, canonical, JSON-LD 추가
- collection static params와 sitemap 포함
- 대표 collection URL Playwright smoke 보강

## 결과

- `support`, `news`, `blog`의 중간 collection URL resolver 추가
- article URL이 우선되고, article이 없으면 실제 글이 있는 collection을 렌더링하도록 catch-all route 확장
- collection 페이지 metadata, canonical, CollectionPage JSON-LD 추가
- 비어 있는 collection은 static params와 sitemap에서 제외
- collection URL을 host별 sitemap에 포함
- 대표 collection URL Playwright smoke 보강

## 검증

- `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-admin-model.test.ts src/lib/__tests__/seo.test.ts src/lib/__tests__/subdomain-routing.test.ts`
  - 4 files, 25 tests passed
- `pnpm --filter @yeon/web typecheck`
  - passed
- `pnpm --filter @yeon/web lint`
  - passed
- `pnpm --dir apps/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium`
  - 15 tests passed
- `pnpm --filter @yeon/web build`
  - passed
  - `/support/[...slug]` collection 포함 SSG 경로 생성 확인
  - `/news/[...slug]` collection 포함 SSG 경로 생성 확인
  - `/blog/[...slug]` collection 포함 SSG 경로 생성 확인
- `git diff --check`
  - passed
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
  - passed
- `bash bin/verify-ssot.sh --project-only`
  - 루트 main 워크트리에서 passed
