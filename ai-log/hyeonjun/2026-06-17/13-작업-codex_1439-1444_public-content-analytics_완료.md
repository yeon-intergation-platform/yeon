# 공개 콘텐츠 운영 지표 추적

## 범위

- `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`의 분리 구조는 유지했다.
- GA4 page view tracker를 root layout에 연결했다.
- 공개 콘텐츠 article link, collection link, CTA click을 추적했다.
- 상담관리/상담 워크스페이스는 범위에서 제외했다.

## 결과

- 시작 시각: 14:39
- 완료 시각: 14:44
- 브랜치: `feat/public-content-analytics-20260617`
- 상태: 완료

## 변경

- `GoogleAnalyticsPageTracker`를 운영 GA4 script 로딩 조건 안에 연결했다.
- `public_content_link_click`, `public_content_cta_click` 이벤트명을 추가했다.
- 공개 콘텐츠 링크 추적용 client anchor를 추가했다.
- 공개 콘텐츠 CTA 이벤트 Playwright smoke 검증을 추가했다.

## 검증

- `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-admin-model.test.ts src/lib/__tests__/seo.test.ts src/lib/__tests__/subdomain-routing.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --dir apps/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
