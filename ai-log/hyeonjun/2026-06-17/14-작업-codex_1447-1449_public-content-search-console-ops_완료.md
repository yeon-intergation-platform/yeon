# 공개 콘텐츠 Search Console 운영 링크

## 범위

- 18차의 Search Console/GA4 운영 지표 항목을 계속 진행했다.
- `/admin/content`와 채널 상세 화면에 수동 확인 링크를 추가했다.
- `docs/seo/google-search-console.md`에 주간/월간 운영 절차를 추가했다.
- Search Console credential/API 자동 수집은 이번 범위에서 제외했다.
- 상담관리/상담 워크스페이스는 제외했다.

## 결과

- 시작 시각: 14:47
- 완료 시각: 14:49
- 브랜치: `feat/public-content-ops-20260617`
- 상태: 완료

## 변경

- 공개 콘텐츠 admin model에서 Search Console, sitemap, robots, GA4 링크를 registry 기준으로 파생했다.
- `/admin/content` 대시보드에 Domain Search Console, GA4, Support CTA 점검 링크를 추가했다.
- 채널 상세 화면에 Search Console, sitemap, robots 링크를 추가했다.
- GA4 측정 ID를 `analytics-constants`로 분리해 layout, client analytics, admin model이 같은 값을 참조하게 했다.
- Search Console 운영 가이드에 주간 snapshot, 월간 점검, GA4 이벤트 확인 절차를 추가했다.

## 검증

- `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-admin-model.test.ts src/features/public-content/public-content-data.test.ts src/lib/__tests__/seo.test.ts src/lib/__tests__/subdomain-routing.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
