# 33-작업-codex_1658-public-content-coverage-report

## 목표

- 확정된 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 역할 분리 정책이 실제 콘텐츠 registry에서 얼마나 채워졌는지 운영자가 볼 수 있게 한다.
- missing bucket을 실패가 아니라 다음 콘텐츠 확장 후보로 드러낸다.

## 범위

- `apps/web/src/features/public-content/public-content-coverage-report.ts`
- `apps/web/src/features/public-content/public-content-coverage-report.test.ts`
- `apps/web/scripts/report-public-content-coverage.ts`
- `apps/web/package.json`
- `docs/seo/public-content-quality-checklist.md`
- `docs/product/backlog/2026-06-17-public-content-coverage-report.md`

## 제외

- 신규 원고 작성
- Spring CMS schema 변경
- admin 편집/삭제/발행 기능
- Google Search Console API 조회

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

- `support`, `news`, `blog` 정책 bucket coverage를 계산하는 `buildPublicContentCoverageReport`를 추가했다.
- 현재 registry 기준으로 33개 글, 12개 target bucket, 9개 채움, 3개 비어 있음을 출력한다.
- 비어 있는 bucket은 `news:news`, `blog:devlog`, `blog:essay`로 다음 콘텐츠 확장 후보가 명확해졌다.
- `public-content:coverage-report` script를 추가하고 운영 체크리스트에 governance report와 함께 기록했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-coverage-report.test.ts` 통과: 1 file, 4 tests.
- `pnpm --filter @yeon/web public-content:coverage-report` 통과: 33개 글, target bucket 12개.
- `pnpm --filter @yeon/web public-content:audit` 통과: 33개 공개 콘텐츠 글 검사 OK.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과: 204개 static page 생성 완료.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.
