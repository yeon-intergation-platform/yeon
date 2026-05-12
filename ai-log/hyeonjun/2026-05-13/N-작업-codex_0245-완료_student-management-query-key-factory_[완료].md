# 작업 로그: student-management query key factory 스코프 정리

## 목표

- student-management의 query key SSOT를 `studentManagementQueryKeys`로 고정한다.
- `membersRoot()` 기반 광역 cache write/invalidation을 가능한 스페이스 단위로 좁힌다.

## 범위

- `apps/web/src/features/student-management/hooks/student-management-query-keys.ts`
- `apps/web/src/features/student-management/hooks/use-student-management-api-state.ts`
- `apps/web/src/features/student-management/hooks/use-custom-tab-fields.ts`
- `apps/web/src/features/student-management/hooks/use-dynamic-member-tabs.ts`
- 관련 소비 컴포넌트/훅 import 정리
- `apps/web/src/app/counseling-service/student-management/layout.tsx`

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree)

## 완료 내용

- `customTabFieldsQueryKey`, `memberTabsQueryKey` 보조 함수를 제거하고 `studentManagementQueryKeys`를 직접 사용하도록 소비처를 정리했다.
- 수강생 목록 refetch를 `membersRoot()` 광역 invalidation에서 현재 `selectedSpaceId`의 `members(spaceId)` exact invalidation으로 좁혔다.
- import 완료 후 수강생 목록 invalidation을 import 결과 `spaceIds` 각각의 `members(spaceId)` exact invalidation으로 좁혔다.
- 멤버 patch cache write를 `setQueriesData({ queryKey: membersRoot() })` 광역 갱신에서 현재 선택 스페이스의 `setQueryData(members(selectedSpaceId))`로 좁혔다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- `git grep -n 'customTabFieldsQueryKey\|memberTabsQueryKey\|setQueriesData<{ members' -- apps/web/src/features/student-management apps/web/src/app/counseling-service/student-management` 결과 없음
- `git grep -n 'queryKey: \[' -- apps/web/src/features/student-management apps/web/src/app/counseling-service/student-management` 결과 없음
