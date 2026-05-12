# counseling-service page 삭제 액션 fetch wrapper 적용 작업 로그

## 목표

- `app/counseling-service/page.tsx` 삭제 핸들러의 직접 fetch 호출을 기존 workspace fetch helper로 통일한다.

## 범위

- 대상: `apps/web/src/app/counseling-service/page.tsx`
- 기존 helper: `apps/web/src/app/counseling-service/_hooks/counseling-workspace-fetch.ts`
- 비범위: 삭제 액션 hook 분리, UI 동작 변경, API 변경

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`

## 완료 내용

- `counseling-service/page.tsx` 삭제 핸들러 3곳의 직접 `fetch()` 호출을 `counselingWorkspaceFetchVoid`로 교체했다.
- 삭제 후 로컬 상태 정리와 React Query invalidation 흐름은 유지했다.
- action hook 분리는 후속 작업으로 남겼다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과 (원본 worktree에서 실행)
- `rg "fetch\(" apps/web/src/app/counseling-service/page.tsx` 결과 0건
