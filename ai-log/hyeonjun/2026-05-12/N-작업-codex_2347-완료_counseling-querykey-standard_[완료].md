# 상담 워크스페이스 queryKey 표준화 작업 로그

## 목표

- `app/counseling-service/**`에 남은 raw queryKey를 상담 워크스페이스 전용 key factory로 묶는다.
- 상담 워크스페이스 이중 구현 제거 전, 실제 사용 경로의 cache key source of truth를 먼저 고정한다.

## 작업 범위

- `apps/web/src/app/counseling-service/_hooks/counseling-workspace-query-keys.ts`
- `apps/web/src/app/counseling-service/_hooks/index.ts`
- `apps/web/src/app/counseling-service/_hooks/use-current-space.ts`
- `apps/web/src/app/counseling-service/_hooks/use-space-members.ts`
- `apps/web/src/app/counseling-service/_hooks/use-records.ts`
- `apps/web/src/app/counseling-service/page.tsx`
- `apps/web/src/app/counseling-service/_components/link-member-modal.tsx`
- `apps/web/src/app/counseling-service/_components/create-space-modal.tsx`

## 검증 결과

- `rg 'queryKey:\s*\[' apps/web/src/app/counseling-service` 통과: raw queryKey 없음.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과. worktree `.git` 파일 제약 때문에 프로젝트 SSOT 검사는 원본 worktree에서 확인했다.

## 진행 상태

- 완료.
