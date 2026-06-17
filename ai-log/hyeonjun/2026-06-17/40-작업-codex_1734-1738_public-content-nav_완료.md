# 작업 로그: 공개 콘텐츠 서비스/분류 내비게이션

시작: 2026-06-17 17:34  
종료: 2026-06-17 17:38  
작업자: codex  
브랜치: `feat/public-content-nav-20260617`

## 목표

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`의 162번, 163번을 진행한다. 공개 콘텐츠 화면에서 서비스/분류 탐색 링크를 공용 모델과 컴포넌트로 렌더링한다.

## 변경

- 공개 콘텐츠 service/category nav 파생 모델을 추가했다.
- 공용 service/category nav view 컴포넌트를 추가했다.
- support 홈은 서비스 nav, news/blog 홈은 분류 nav를 노출하게 했다.
- collection 화면은 현재 service/category에 맞는 탐색 링크를 노출하게 했다.
- 기존 collection child link 특수 구현을 공용 nav로 대체했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-navigation.test.ts src/features/public-content/public-content-data.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
