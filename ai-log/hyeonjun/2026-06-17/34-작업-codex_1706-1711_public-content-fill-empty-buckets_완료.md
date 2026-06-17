# 34-작업-codex_1706-public-content-fill-empty-buckets

## 목표

- coverage report가 비어 있다고 잡은 `news/news`, `blog/devlog`, `blog/essay` bucket을 초기 evergreen 글로 채운다.
- 최신 외부 사건을 다루지 않고, YEON 공개 콘텐츠 운영 정책과 제작 기록 중심으로 정확성을 유지한다.

## 범위

- `apps/web/src/features/public-content/public-content-data.ts`
- `apps/web/src/features/public-content/public-content-coverage-report.test.ts`
- `docs/product/backlog/2026-06-17-public-content-fill-empty-buckets.md`

## 제외

- 최신 외부 뉴스 인용
- Search Console/GA4 API 조회
- admin 편집/삭제/발행 기능

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

## 결과

- `news/news` bucket에 `NEXA와 Discord AI 뉴스 해설을 운영하는 기준 안내` 글을 추가했다.
- `blog/devlog` bucket에 `YEON 공개 콘텐츠 네트워크를 시작하며 배운 운영 구조` 글을 추가했다.
- `blog/essay` bucket에 `개인 제품에서 support 문서를 먼저 만드는 이유` 글을 추가했다.
- coverage report 기준 target bucket 12개가 모두 채워졌고 missing bucket은 0개가 됐다.
- build 결과 정적 페이지가 213개로 늘며 `/news/news`, `/blog/devlog`, `/blog/essay` 경로가 생성됐다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-coverage-report.test.ts src/features/public-content/public-content-governance-report.test.ts src/features/public-content/public-content-admin-model.test.ts` 통과: 3 files, 15 tests.
- `pnpm --filter @yeon/web public-content:coverage-report` 통과: 36개 글, target bucket 12개, missing 0개.
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 공개 콘텐츠 글 검사 OK.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과: 213개 static page 생성 완료.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.
