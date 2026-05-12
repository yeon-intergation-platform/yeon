# 상담 워크스페이스 fetch wrapper 표준화 작업 로그

## 목표

- 상담 워크스페이스 React Query `queryFn`의 직접 `fetch()`를 도메인 wrapper로 모은다.
- queryKey factory 도입 뒤 남은 raw `setQueryData/getQueryData` key 사용을 함께 제거한다.
- 학생관리/AI/업로드 전체 fetch 통합은 다음 차수로 분리한다.

## 작업 범위

- `apps/web/src/app/counseling-service/_hooks/counseling-workspace-fetch.ts`
- `apps/web/src/app/counseling-service/_hooks/use-current-space.ts`
- `apps/web/src/app/counseling-service/_hooks/use-space-members.ts`
- `apps/web/src/app/counseling-service/_hooks/use-records.ts`
- `apps/web/src/app/counseling-service/_components/link-member-modal.tsx`
- `apps/web/src/app/counseling-service/_components/create-space-modal.tsx`

## 검증 결과

- `rg 'queryKey:\s*\[' apps/web/src/app/counseling-service` 통과: raw queryKey 없음.
- `rg '\["spaces"|\["counseling-record|\["space-members|\["space-templates|\["counseling-records"' apps/web/src/app/counseling-service` 통과: 상담 workspace raw cache key 없음.
- 핵심 workspace 파일 직접 `fetch()` 검색 통과: `_hooks/use-current-space.ts`, `_hooks/use-space-members.ts`, `_hooks/use-records.ts`, `_components/link-member-modal.tsx`, `_components/create-space-modal.tsx`.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과. worktree `.git` 파일 제약 때문에 프로젝트 SSOT 검사는 원본 worktree에서 확인했다.

## 진행 상태

- 완료.
