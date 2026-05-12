# student management local drafts query hook 분리

## 목표

- `student-management/layout.tsx`에서 local import drafts query 조립 책임을 제거한다.
- query key/fetch wrapper/API href 조립은 feature hook으로 이동한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `useStudentManagementLocalDrafts` feature hook을 추가해 local import drafts query 조립을 layout에서 제거했다.
- `student-management/layout.tsx`는 hook 결과만 받아 sidebar/modal에 전달하도록 축소했다.
- app `_lib/space-sidebar-types.ts`에서 local draft summary 타입을 제거하고 feature hook 소유 타입으로 이동했다.
- 라인 수: `student-management/layout.tsx` 389줄 → 372줄.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
