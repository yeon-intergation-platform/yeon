# 31-작업-codex_1644-public-content-governance-report

## 목표

- 공개 콘텐츠 500단계 계획 중 20차 출시 후 운영/거버넌스 항목을 진전시킨다.
- Search Console/GA4 수동 확인 항목과 repo 기반 자동 evidence를 한 번에 볼 수 있는 리포트를 만든다.

## 범위

- `apps/web/src/features/public-content/public-content-governance-report.ts`
- `apps/web/src/features/public-content/public-content-governance-report.test.ts`
- `apps/web/scripts/report-public-content-governance.ts`
- `apps/web/package.json`
- `docs/seo/public-content-quality-checklist.md`
- `docs/seo/google-search-console.md`

## 제외

- Search Console API 자동 조회
- GA4 API 자동 조회
- admin 본문 수정/삭제/발행 기능

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-governance-report.test.ts`
- `pnpm --filter @yeon/web public-content:governance-report`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`

## 결과

- `public-content:governance-report` CLI를 추가해 출시 첫 주, 월간, 변경 발생 시 점검 항목을 Markdown으로 출력하게 했다.
- Search Console/GA4처럼 credential이 필요한 항목은 `수동 확인`으로 두고, sitemap/title/source/SEO 상태는 repo 기반 evidence로 `정상` 또는 `확인 필요`를 계산한다.
- 품질 체크리스트와 Search Console 운영 가이드에 리포트 실행 순서를 연결했다.
- 현재 registry 기준 리포트는 channel 3개, article 33개, 정상 5개, 수동 확인 9개, 확인 필요 0개로 출력된다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-governance-report.test.ts` 통과
- `pnpm --filter @yeon/web public-content:governance-report` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
