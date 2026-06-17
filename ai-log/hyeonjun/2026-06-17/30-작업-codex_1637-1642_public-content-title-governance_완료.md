# 30-작업-codex_1637-public-content-title-governance

## 목표

- 공개 콘텐츠 500단계 계획 중 20차 거버넌스 항목을 진전시킨다.
- support/news/blog 제목 작성 원칙을 문서와 자동 품질 게이트에 연결한다.

## 범위

- `docs/seo/public-content-title-guidelines.md`
- `docs/seo/public-content-quality-checklist.md`
- `docs/seo/README.md`
- `apps/web/src/features/public-content/public-content-title-quality.ts`
- `apps/web/src/features/public-content/public-content-title-quality.test.ts`
- `apps/web/src/features/public-content/public-content-admin-model.ts`
- `apps/web/src/features/public-content/public-content-admin-model.test.ts`
- `apps/web/scripts/audit-public-content-quality.ts`

## 제외

- admin 본문 수정/삭제/발행 기능
- Search Console 실제 제출 또는 Google credential 처리
- 상담 워크스페이스 콘텐츠

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-title-quality.test.ts src/features/public-content/public-content-admin-model.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`

## 결과

- `docs/seo/public-content-title-guidelines.md`를 추가해 support/news/blog 제목 작성 원칙을 분리했다.
- 제목 품질 helper를 추가하고 `public-content:audit`와 admin SEO warning queue가 같은 규칙을 쓰게 했다.
- `/admin/content` 운영 체크리스트에 `Title quality` 항목을 추가했다.
- 현재 static registry 33개 글은 제목 품질 audit를 통과한다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-title-quality.test.ts src/features/public-content/public-content-admin-model.test.ts` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
