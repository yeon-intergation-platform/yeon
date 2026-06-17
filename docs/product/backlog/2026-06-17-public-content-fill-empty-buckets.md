# 공개 콘텐츠 빈 Bucket 채우기

작성일: 2026-06-17
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 15차 360~370 및 coverage 후속
범위: `news/news`, `blog/devlog`, `blog/essay` 초기 글 3개
제외: 최신 외부 뉴스 인용, Search Console API 조회, 신규 admin 편집 기능

## 1차: Coverage missing bucket 해소

논의 필요: `news/news`를 실제 최신 업계 뉴스로 채울지 운영 해설 기준 글로 채울지.
선택지: 최신 뉴스 해설, 운영 기준 evergreen 글, 둘 다.
추천: 지금은 외부 최신 사건을 무리하게 다루지 않고, YEON 사용자가 업계 뉴스를 어떻게 읽어야 하는지 설명하는 evergreen 해설 글로 시작한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `news/news` category에 AI/Discord 업계 뉴스 해설 기준 글을 추가한다.
2. `blog/devlog` category에 공개 콘텐츠 네트워크 제작 일지를 추가한다.
3. `blog/essay` category에 개인 제품에서 support 문서를 먼저 만드는 이유 글을 추가한다.
4. coverage report의 missing bucket이 0개가 되는지 확인한다.

## 2차: 검증

논의 필요: 신규 원고를 시각 확인까지 할지, registry/audit/build로 충분한지.
선택지: unit/audit/build, Playwright 포함, 운영 배포 확인.
추천: 이번 변경은 정적 registry 원고 추가이므로 unit/audit/build로 먼저 증명한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. coverage report 테스트 기대값을 갱신한다.
2. public-content audit를 통과시킨다.
3. sitemap/SSG 빌드가 3개 글을 포함해 깨지지 않는지 확인한다.

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-coverage-report.test.ts`
- `pnpm --filter @yeon/web public-content:coverage-report`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
