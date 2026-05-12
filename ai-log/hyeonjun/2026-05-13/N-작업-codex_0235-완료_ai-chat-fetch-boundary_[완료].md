# AI chat fetch boundary 정리

## 목표

- 상담 AI 채팅 hook의 직접 `fetch()` 호출을 제거하고 상담 워크스페이스 fetch wrapper로 통일한다.

## 변경

- `counselingWorkspaceFetchResponse` 추가: SSE처럼 raw `Response`/body가 필요한 요청도 공통 credentials/error parsing을 거치게 함.
- `use-ai-chat.ts` 채팅 SSE 요청을 `counselingWorkspaceFetchResponse`로 교체.
- 자동 분석 요청을 `counselingWorkspaceFetchJson`으로 교체.
- 스트리밍 메시지 누적, abort, 자동 분석 실패 로깅 흐름은 유지.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree에서 실행)
- `git grep -n '\\bfetch(' -- apps/web/src/app/counseling-service/_hooks/use-ai-chat.ts` → 없음
