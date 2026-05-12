# record retry fetch boundary 정리

## 목표

- 상담 기록 전사/분석 재시도 hook의 직접 `fetch()` 호출을 제거하고 상담 워크스페이스 fetch wrapper로 통일한다.

## 변경

- `use-record-retry.ts` 전사 재시도 요청을 `counselingWorkspaceFetchJson`으로 교체.
- AI 분석 재시도 요청을 `counselingWorkspaceFetchVoid`로 교체.
- 재시도 pending/feedback, polling boost, detail 적용 흐름은 유지.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree에서 실행)
- `git grep -n '\\bfetch(' -- apps/web/src/app/counseling-service/_hooks/use-record-retry.ts` → 없음
