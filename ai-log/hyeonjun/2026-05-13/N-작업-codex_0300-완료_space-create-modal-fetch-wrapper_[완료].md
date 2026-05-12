# 작업 로그: space create modal fetch wrapper 정리

## 목표

- `space-create-modal.tsx`의 직접 `fetch()` 호출을 제거한다.
- 빈 스페이스 생성 요청을 `studentManagementFetchJson`으로 통일한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree)

## 완료 내용

- `space-create-modal.tsx`의 빈 스페이스 생성 직접 `fetch()` 호출을 제거했다.
- 생성 요청을 `studentManagementFetchJson` wrapper로 통일했다.
- 이름/기간 validation, `onCreated`, `onClose`, import mode 흐름은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- `git grep -n '\bfetch(' -- apps/web/src/features/student-management/components/space-create-modal.tsx` 결과 없음
