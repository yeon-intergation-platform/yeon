# 작업 로그: public check page hook 분리

## 목표

- `apps/web/src/app/check/[token]/page.tsx` 내부의 session query, verify mutation, submit mutation을 전용 훅으로 분리한다.
- 페이지는 route param/form state/렌더링 중심으로 축소한다.

## 범위

- `apps/web/src/app/check/[token]/page.tsx`
- `apps/web/src/app/check/[token]/_hooks/use-public-check.ts`

## 진행

- 2026-05-13 00:52 KST: 작업 시작.

- 2026-05-13 01:02 KST: session query, verify mutation, submit mutation, geolocation submit payload 구성을 `_hooks/use-public-check.ts`로 분리. `page.tsx` 474줄 → 305줄.

## 검증

- `wc -l apps/web/src/app/check/[token]/page.tsx apps/web/src/app/check/[token]/_hooks/use-public-check.ts` → 305 / 260 lines
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 원본 worktree에서 통과
