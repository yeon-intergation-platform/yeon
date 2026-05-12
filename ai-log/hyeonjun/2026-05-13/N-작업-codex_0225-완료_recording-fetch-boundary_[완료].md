# recording upload fetch boundary 정리

## 목표

- 녹음 업로드 hook의 직접 `fetch()` 호출을 제거하고 상담 워크스페이스 fetch wrapper로 통일한다.

## 변경

- `use-recording.ts`의 녹음 파일 업로드 요청을 `counselingWorkspaceFetchJson`으로 교체.
- 업로드 실패 fallback 메시지를 한국어 표준 형태로 정리.
- `start` callback deps에 `getDefaultRecordContext`를 포함해 최신 기본 연결 정보를 참조하게 유지.
- 녹음 임시 레코드/업로드 완료 레코드 변환 흐름은 유지.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree에서 실행)
- `git grep -n '\\bfetch(' -- apps/web/src/app/counseling-service/_hooks/use-recording.ts` → 없음
