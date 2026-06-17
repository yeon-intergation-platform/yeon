# 11-작업-codex_1426-1430_public-content-smoke-qa

## 범위

- 브랜치: `feat/public-content-smoke-qa-20260617`
- 목적: 500단계 계획 17차의 공개 콘텐츠 QA/SEO smoke 검증을 자동화한다.
- 제외: 상담관리/상담 워크스페이스. 동결 정책에 따라 검증 범위에 포함하지 않는다.

## 코드/문서 근거

- `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`
- `docs/product/backlog/2026-06-17-public-content-smoke-qa.md`
- `apps/web/src/features/public-content/public-content-data.ts`
- `apps/web/src/features/public-content/public-content-ui.tsx`
- `apps/web/src/lib/subdomain-routing.ts`
- `apps/web/src/lib/seo.ts`

## 변경 예정

- `apps/web/e2e/public-content-smoke.spec.ts` 추가
- 공개 콘텐츠 홈/대표 글의 canonical, meta description, JSON-LD smoke 검증
- Host 헤더 기반 rewrite, robots, sitemap smoke 검증

## 결과

- `apps/web/e2e/public-content-smoke.spec.ts` 추가
- `/support`, `/news`, `/blog` 홈과 대표 글 3개의 public metadata smoke 검증 추가
- `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` Host 헤더 rewrite 검증 추가
- host별 `robots.txt`, `sitemap.xml` 응답 검증 추가
- 첫 Playwright 실행에서 로컬 Chromium 바이너리가 없어 브라우저 기반 테스트만 실패했고, `pnpm --dir apps/web exec playwright install chromium` 실행 후 최종 통과 확인

## 검증

- `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-admin-model.test.ts src/lib/__tests__/seo.test.ts src/lib/__tests__/subdomain-routing.test.ts`
  - 3 files, 22 tests passed
- `pnpm --dir apps/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium`
  - 12 tests passed
- `pnpm --filter @yeon/web typecheck`
  - passed
- `pnpm --filter @yeon/web lint`
  - passed
- `pnpm --filter @yeon/web build`
  - passed
  - `/support`, `/news`, `/blog` 홈 생성 확인
  - `/support/[...slug]`: 기존 표시 3개 + 15개 추가 경로
  - `/news/[...slug]`: 기존 표시 3개 + 5개 추가 경로
  - `/blog/[...slug]`: 기존 표시 3개 + 4개 추가 경로
- `git diff --check`
  - passed
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
  - passed
- `bash bin/verify-ssot.sh --project-only`
  - 루트 main 워크트리에서 passed
