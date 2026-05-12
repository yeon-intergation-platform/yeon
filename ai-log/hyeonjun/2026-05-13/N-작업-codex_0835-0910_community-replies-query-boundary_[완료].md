# 커뮤니티 댓글 Query 경계 정리

## 목표

- 커뮤니티 피드 댓글 목록 서버 상태를 React Query로 전환한다.
- 댓글 draft/펼침 같은 UI 상태는 local state로 유지한다.

## 변경

- 댓글 목록을 `communityQueryKeys.feedReplies(postId)` 기반 `useQueries`로 조회한다.
- 상세 페이지처럼 명시적으로 댓글을 여는 경로를 위해 `loadReplies`가 해당 postId를 query 대상에 등록하고 prefetch한다.
- 댓글 작성/삭제 성공 시 해당 댓글 목록 key를 invalidate한다.
- 게시글 목록의 `replyCount` 캐시 보정은 기존처럼 유지한다.
- 댓글 draft/펼침/검증 오류/삭제 오류는 local state로 유지했다.

## 검증

- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
- community/app raw queryKey 검색 결과 없음 ✅
