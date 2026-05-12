# 작업 로그: student member new page fetch wrapper 정리

## 목표

- `members/new/page.tsx`의 직접 `fetch()` 호출을 `studentManagementFetchJson`으로 교체한다.
- 수강생 생성 성공 후 목록 refetch/route 이동 동작은 유지한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree)

## 완료 내용

- `members/new/page.tsx`의 직접 `fetch()` 호출을 제거했다.
- 수강생 생성 요청을 `studentManagementFetchJson` wrapper로 통일했다.
- 생성 성공 후 `refetchMembers()`와 목록 이동 동작은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- `git grep -n '\bfetch(' -- apps/web/src/app/counseling-service/student-management/members/new/page.tsx` 결과 없음
