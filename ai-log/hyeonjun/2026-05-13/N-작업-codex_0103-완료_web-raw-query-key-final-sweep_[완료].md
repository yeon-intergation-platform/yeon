# 작업 로그: web raw queryKey final sweep

## 목표

- `apps/web/src`에 남은 raw queryKey literal을 서비스별 key helper/factory로 이동한다.
- React Query key source of truth를 파일별 inline 배열에서 named function으로 승격한다.

## 범위

- cloud-import local draft/file preview query keys
- life-os day query key
- space-settings template detail query key
- typing-service character frame/lobby query keys

## 진행

- 2026-05-13 01:03 KST: 작업 시작.

- 2026-05-13 01:12 KST: cloud-import, life-os, space-settings, typing-service에 남은 raw queryKey literal 9개를 named key helper/factory로 이동.

## 검증

- `rg "queryKey:\s*\[|getQueryData\(\[|setQueryData\(\[|invalidateQueries\(\{\s*queryKey:\s*\[" apps/web/src` 결과 없음
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 원본 worktree에서 통과
