# 35-작업-codex_1715-public-content-structured-data

## 목표

- 500단계 계획 12차의 `Article structured data`, `BreadcrumbList`, support FAQPage, support HowTo structured data 항목을 실제 article detail에 반영한다.
- 구조화 데이터는 registry 본문에서만 파생하고, 본문에 없는 내용을 만들지 않는다.

## 범위

- `apps/web/src/features/public-content/public-content-structured-data.ts`
- `apps/web/src/features/public-content/public-content-structured-data.test.ts`
- `apps/web/src/features/public-content/public-content-ui.tsx`
- `docs/product/backlog/2026-06-17-public-content-structured-data.md`

## 제외

- Google Search Console/GA4 API 조회
- 외부 최신 SEO 문서 재조사
- 신규 원고 작성

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-structured-data.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`

## 결과

- article detail JSON-LD 생성을 `public-content-structured-data.ts` 순수 helper로 분리했다.
- 모든 공개 article detail이 `Article`/`NewsArticle`/`BlogPosting`과 `BreadcrumbList`를 `@graph`에 함께 렌더링한다.
- support FAQ 글은 `FAQPage`를 본문 텍스트에서 파생한다.
- support steps 글은 `HowTo`와 `HowToStep`을 registry `steps` block 순서대로 파생한다.
- news/blog 글에는 support 전용 `FAQPage`/`HowTo`가 붙지 않게 고정했다.
- 이전 콘텐츠 확장으로 stale해진 `public-content-data.test.ts`의 devlog collection 기대값을 현재 registry 기준으로 고쳤다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-data.test.ts` 통과: 2 files, 8 tests.
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 공개 콘텐츠 글 검사 OK.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과: 213개 static page 생성 완료.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.
