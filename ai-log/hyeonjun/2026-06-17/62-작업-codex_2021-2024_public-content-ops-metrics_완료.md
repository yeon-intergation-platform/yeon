# 62. public content ops metrics

- 시작: 2026-06-17 20:21 KST
- 범위: 500단계 계획 18차 426~450
- 목표: Search Console/GA4 운영 지표와 credential-gated Google API 실행 기준을 admin 체크리스트, governance report, SEO 운영 문서에 고정한다.
- 제약: 실제 Search Console property 등록과 sitemap 제출은 Google credential이 필요하므로 이번 차수에서는 실행하지 않고, credential 준비 후 실행 절차로 분리한다.
- 종료: 2026-06-17 20:24 KST

## 변경

- `/admin/content` 운영 체크리스트에 host별 page_view, channel click event, weekly/monthly Search Console, article query tracking, Google API credential gate, GitHub API polling policy를 추가했다.
- 공개 콘텐츠 governance report에 support/news/blog URL-prefix 등록 확인, sitemap 실패, GA4 host/event 확인, 월간 색인/404/canonical 점검, credential-gated API 실행 기준을 추가했다.
- `docs/seo/google-search-console.md`에 Search Console 등록/제출 대상, verification/credential 관리, GA4 이벤트 의미, 주간/월간 운영 기록 기준을 보강했다.
- 500단계 계획 426~450을 완료 처리했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-admin-model.test.ts src/features/public-content/public-content-governance-report.test.ts` 통과: 2 files, 11 tests.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web public-content:governance-report` 통과: article 61개, warning 0개.
- `pnpm --filter @yeon/web public-content:audit` 통과: 61개 글 검사 OK.
- `pnpm --filter @yeon/web public-content:coverage-report` 통과: target bucket 12개 모두 채움.
- `pnpm --filter @yeon/web build` 통과: 249 pages.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.
