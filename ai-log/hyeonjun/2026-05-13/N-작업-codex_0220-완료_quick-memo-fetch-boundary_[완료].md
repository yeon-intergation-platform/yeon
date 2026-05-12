# quick memo fetch boundary 정리

## 목표

- 텍스트 메모 모달의 직접 `fetch()` 호출을 제거하고 상담 워크스페이스 fetch wrapper로 통일한다.

## 변경

- `quick-memo-modal.tsx`의 메모 저장 요청을 `counselingWorkspaceFetchJson`으로 교체.
- 저장 실패 fallback 메시지를 한국어 표준 형태로 정리.
- 입력 UI와 `RecordItem` 변환 로직은 유지.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree에서 실행)
- `git grep -n '\\bfetch(' -- apps/web/src/app/counseling-service/_components/quick-memo-modal.tsx` → 없음
