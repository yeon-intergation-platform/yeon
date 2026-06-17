# 32-작업-codex_1650-public-content-freshness-review

## 목표

- 공개 콘텐츠 500단계 계획 중 20차 최신성/오래된 support 글 점검 항목을 진전시킨다.
- support 글 detail과 운영 리포트에서 최근 확인일과 stale 상태를 볼 수 있게 한다.

## 범위

- `apps/web/src/features/public-content/public-content-data.ts`
- `apps/web/src/features/public-content/public-content-freshness.ts`
- `apps/web/src/features/public-content/public-content-freshness.test.ts`
- `apps/web/src/features/public-content/public-content-ui.tsx`
- `apps/web/src/features/public-content/public-content-governance-report.ts`
- `apps/web/src/features/public-content/public-content-governance-report.test.ts`
- `docs/seo/public-content-quality-checklist.md`
- `docs/product/backlog/2026-06-17-public-content-freshness-review.md`

## 제외

- Spring DB schema 확장
- admin 본문 수정/삭제/발행 기능
- Search Console/GA4 API 조회

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-freshness.test.ts src/features/public-content/public-content-governance-report.test.ts`
- `pnpm --filter @yeon/web public-content:governance-report`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`

## 결과

- `PublicContentArticle.reviewedAt` optional 필드를 열고, 없으면 `updatedAt`을 최근 확인일로 쓰는 freshness helper를 추가했다.
- support 글 detail 상단 메타에 `최근 확인 YYYY-MM-DD`를 표시했다.
- admin dashboard 내부 view가 `reviewedAt`을 보존하게 하고, governance report의 `오래된 글 최신성 점검`을 자동 ready/warning 항목으로 바꿨다.
- `reviewedAt`이 `updatedAt`보다 우선되는지, 180일 초과 support 글이 warning이 되는지 테스트로 고정했다.
- 품질 체크리스트에 support 글 detail의 실제 서비스 동작 확인일 점검 항목을 추가했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-freshness.test.ts src/features/public-content/public-content-governance-report.test.ts` 통과: 2 files, 9 tests.
- `pnpm --filter @yeon/web public-content:governance-report` 통과: 33개 글, 확인 필요 0개.
- `pnpm --filter @yeon/web public-content:audit` 통과: 33개 공개 콘텐츠 글 검사 OK.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과: 204개 static page 생성 완료.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.
