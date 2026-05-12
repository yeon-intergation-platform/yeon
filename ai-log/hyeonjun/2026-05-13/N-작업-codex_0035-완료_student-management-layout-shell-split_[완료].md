# 작업 로그: student-management layout shell 분해

## 목표

- `apps/web/src/app/counseling-service/student-management/layout.tsx`에 집중된 desktop/mobile sidebar UI와 action dialog UI를 별도 컴포넌트로 분리한다.
- route layout은 provider/shell 조립과 상태 orchestration 중심으로 축소한다.
- 학생관리 동작, 라우팅, queryKey/fetch wrapper 계약은 변경하지 않는다.

## 범위

- 대상 파일: `apps/web/src/app/counseling-service/student-management/layout.tsx`
- 신규 후보:
  - `_components/student-management-shell-sidebar.tsx`
  - `_components/student-management-mobile-space-drawer.tsx`
  - `_components/student-management-space-action-dialogs.tsx`
- 검증: `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web build`, `git diff --check`, SSOT 검증

## 진행

- 2026-05-13 00:35 KST: 작업 시작.

- 2026-05-13 00:45 KST: desktop sidebar, mobile drawer/action sheet, rename/delete/context menu UI를 `_components`로 분리. `layout.tsx` 948줄 → 479줄.

## 검증

- `wc -l apps/web/src/app/counseling-service/student-management/layout.tsx` → 479 lines
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 원본 worktree에서 통과
