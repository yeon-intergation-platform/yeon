# 작업 로그: space sidebar action fetch wrapper 정리

## 목표

- 학생관리 스페이스 사이드바 액션의 직접 `fetch()` 호출을 제거한다.
- 삭제/이름 변경 요청을 `studentManagementFetchVoid`로 통일한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree)

## 완료 내용

- `use-space-sidebar-actions.ts`의 스페이스 삭제/이름 변경 직접 `fetch()` 호출을 제거했다.
- 두 요청 모두 `studentManagementFetchVoid` wrapper로 통일했다.
- 삭제 후 선택 초기화, 상세 route reset, refetch, 메뉴 상태 정리 흐름은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- `git grep -n '\bfetch(' -- apps/web/src/app/counseling-service/student-management/_hooks/use-space-sidebar-actions.ts` 결과 없음
