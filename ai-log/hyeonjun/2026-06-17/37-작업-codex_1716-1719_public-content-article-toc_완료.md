# 공개 콘텐츠 article 목차

## 목표

- 500단계 계획의 article detail 목차 항목을 진행한다.
- heading block에서 공용 table of contents를 파생한다.
- 데스크톱 왼쪽 목차와 모바일 접힘 목차를 추가한다.

## 범위

- `apps/web/src/features/public-content`
- 공개 콘텐츠 목차 백로그

## 제외

- markdown parser 교체
- analytics 이벤트 계약 확장
- Search Console/GA4 설정 변경

## 변경

- heading block 기반 목차 helper와 unit test를 추가했다.
- article detail heading에 `section-N` anchor id를 붙였다.
- 데스크톱에는 왼쪽 sticky 목차, 모바일에는 접힘 목차를 추가했다.
- 목차가 없는 글은 기존 단일 본문 레이아웃을 유지하게 했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-table-of-contents.test.ts` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 글
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과: 213 static pages
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
