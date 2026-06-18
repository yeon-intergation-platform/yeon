# 4-작업-codex*1357-1400_next-build-searchparams-suspense*완료

## 목표

- GitHub Actions 배포 실패 원인인 Next production build의 `useSearchParams()` Suspense 경계 오류를 수정한다.

## 근거

- 실패 로그: `useSearchParams() should be wrapped in a suspense boundary at page "/404"` 및 `/auth/error`.
- 원인: root layout에서 `GoogleAnalyticsPageTracker`가 직접 렌더링되고, 해당 client component가 `useSearchParams()`를 사용한다.

## 작업

- `apps/web/src/app/layout.tsx`에서 GA 페이지 추적 컴포넌트를 `Suspense fallback={null}`로 감쌌다.
- 배포 실패 재현 지점인 `@yeon/web` production build를 로컬에서 통과시켰다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` (`yeon-4` linked worktree에서는 프로젝트 검사를 건너뛰므로 root `yeon`에서 재실행하여 통과 확인)
