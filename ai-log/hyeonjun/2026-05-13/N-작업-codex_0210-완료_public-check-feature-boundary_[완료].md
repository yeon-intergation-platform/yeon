# public-check feature boundary 정리

## 목표

- `app/check/[token]` 내부 hook에 있던 server-state/API 책임을 feature layer로 이동한다.
- public-check 직접 fetch 호출을 전용 API boundary로 모은다.

## 변경

- `features/public-check/hooks/use-public-check.ts` 생성: 기존 세션/검증/제출 mutation hook 이동.
- `features/public-check/public-check-api.ts` 생성: 세션 조회, 본인 확인, 체크인 제출 fetch 분리.
- `features/public-check/public-check-query-keys.ts` 생성: public-check query key factory 추가.
- `app/check/[token]/page.tsx`는 feature hook import만 사용하도록 변경.
- 기존 `app/check/[token]/_hooks/use-public-check.ts` 제거.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree에서 실행)
- `git grep -n '\\bfetch(' -- 'apps/web/src/app/check/[token]'` → 없음
- `git grep -n 'queryKey: \\[' -- apps/web/src/features/public-check 'apps/web/src/app/check/[token]'` → 없음
