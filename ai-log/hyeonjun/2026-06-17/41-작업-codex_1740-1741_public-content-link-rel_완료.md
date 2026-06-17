# 작업 로그: 공개 콘텐츠 외부 링크 rel 정책

시작: 2026-06-17 17:40  
종료: 2026-06-17 17:41  
작업자: codex  
브랜치: `feat/public-content-link-rel-20260617`

## 목표

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`의 167번을 진행한다. 공개 콘텐츠 링크 컴포넌트가 외부 absolute URL과 새 탭 링크의 `rel` 정책을 일관되게 적용하게 한다.

## 변경

- 공개 콘텐츠 링크 `rel` 값을 계산하는 순수 함수를 추가했다.
- absolute `http`/`https` URL에는 기본 `noopener`를 적용한다.
- `target="_blank"` 링크에는 기본 `noopener noreferrer`를 적용한다.
- 호출자가 명시한 `rel`은 덮어쓰지 않는다.
- `PublicContentTrackedLink`가 rel 정책을 적용하도록 연결했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-link-policy.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `pnpm --filter @yeon/web public-content:audit`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
