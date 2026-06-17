# 작업 로그: 공개 콘텐츠 404 이동 경로

시작: 2026-06-17 17:49  
종료: 2026-06-17 17:50  
작업자: codex  
브랜치: `feat/public-content-not-found-20260617`

## 목표

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`의 175번을 진행한다. 공개 콘텐츠 404에서 해당 channel 홈과 최근 글로 이동할 수 있게 한다.

## 변경

- support/news/blog channel별 not-found route를 추가했다.
- 공개 콘텐츠 not-found 화면에서 channel 홈 링크를 제공한다.
- 공개 콘텐츠 not-found 화면에서 해당 channel의 최신 글 3개를 제공한다.
- 최근 글 선택 로직을 순수 함수로 분리하고 테스트했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-not-found.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `pnpm --filter @yeon/web public-content:audit`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
