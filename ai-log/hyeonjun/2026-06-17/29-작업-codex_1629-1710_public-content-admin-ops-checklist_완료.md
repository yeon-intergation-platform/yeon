# 29-작업-codex_1629-public-content-admin-ops-checklist

## 목표

- 공개 콘텐츠 500단계 계획 중 18차 Search Console/운영 지표와 20차 admin dashboard 품질 checklist 상태를 진전시킨다.
- `/admin/content`에서 Search Console, sitemap, robots, GA4, SEO 경고 상태를 읽기 전용으로 확인하게 한다.

## 범위

- `apps/web/src/features/public-content/public-content-admin-model.ts`
- `apps/web/src/features/public-content/public-content-admin-model.test.ts`
- `apps/web/src/features/admin/admin-public-content-screen.tsx`
- `docs/seo/google-search-console.md`

## 제외

- Search Console 실제 등록/제출 실행
- Google credential 저장
- admin 생성/수정/삭제/발행 기능

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-admin-model.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec eslint src/features/public-content/public-content-admin-model.ts src/features/public-content/public-content-admin-model.test.ts src/features/admin/admin-public-content-screen.tsx`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web public-content:audit`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`

## 결과

- `/admin/content` dashboard에 읽기 전용 운영 체크리스트를 추가했다.
- Search Console domain property와 URL-prefix property는 credential 준비 전까지 수동 확인으로 표시한다.
- sitemap, robots, GA4 measurement ID, SEO warning queue, source traceability는 현재 registry/dashboard data 기준으로 자동 상태를 계산한다.
- `docs/seo/google-search-console.md`에 admin checklist 확인 순서를 연결했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-admin-model.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web exec eslint src/features/public-content/public-content-admin-model.ts src/features/public-content/public-content-admin-model.test.ts src/features/admin/admin-public-content-screen.tsx` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
