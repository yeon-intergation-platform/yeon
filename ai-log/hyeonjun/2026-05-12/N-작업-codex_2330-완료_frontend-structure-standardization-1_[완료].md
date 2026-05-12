# 프론트 구조 표준화 2~5차 1차 실행 로그

## 목표

- 프론트 구조 리뷰에서 나온 2~5차 목표를 실제 코드로 진행한다.
- 첫 PR 범위는 raw queryKey inventory 문서화와 student-management key/fetch 표준화로 제한한다.

## 완료 내용

- 2~5차 실행 백로그를 `docs/product/backlog/frontend-structure-standardization-20260512.md`에 작성했다.
- `apps/web/src` raw queryKey inventory를 `docs/architecture/web-server-state-querykey-inventory-20260512.md`에 기록했다.
- `studentManagementQueryKeys`를 추가해 수강생 관리 핵심 key를 factory로 통일했다.
- `studentManagementFetchJson` / `studentManagementFetchVoid`를 추가해 수강생 관리 hook의 fetch/error 처리를 통일했다.
- `features/student-management/**`와 `app/counseling-service/student-management/layout.tsx`의 raw `queryKey: [`를 제거했다.

## 검증 결과

- `rg 'queryKey:\s*\[' apps/web/src/features/student-management apps/web/src/app/counseling-service/student-management` 통과: 출력 없음.
- `rg 'queryKey:\s*\[' apps/web/src` 결과: 남은 raw key 27개를 inventory 문서에 기록.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과. worktree의 `.git` file 인식 제한 때문에 원본 worktree에서 같은 프로젝트 SSOT 검증을 수행했다.

## 남은 일

- 다음 PR: `app/counseling-service/**`에 남은 15개 raw key를 `counselingWorkspaceQueryKeys`로 묶고, 상담 워크스페이스 이중 구현 제거 범위를 확정한다.
- 이후 PR: typing/cloud-import/public-check/life-os/space-settings 순서로 raw key와 직접 fetch를 제거한다.
- 이후 PR: `use-records.ts`부터 서버 원본/로컬 override/temp record 분리를 시작한다.
