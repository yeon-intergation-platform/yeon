# 커뮤니티 피드 Query 경계 정리

## 목표

- 커뮤니티 피드 게시글 목록 서버 상태를 React Query로 전환한다.
- 신규 규칙은 임시 로컬 파일이 아니라 추적되는 문서/스킬을 기준으로 유지한다.

## 변경

- `communityQueryKeys`에 feed/posts/replies key factory를 추가했다.
- `use-community-feed.ts`의 게시글 목록 server state를 `useQuery`로 전환했다.
- 글 작성은 성공 시 게시글 목록 key를 invalidate한다.
- 글 수정/삭제와 댓글 replyCount 보정은 `queryClient.setQueryData`로 게시글 목록 캐시만 갱신한다.
- 댓글 draft/펼침/댓글 목록 로딩 등 local UI 상태는 기존 hook state에 유지했다.
- `CommunityPage`의 수동 mount load effect를 제거해 QueryProvider 경계의 자동 fetch를 기준으로 삼았다.

## 검증

- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
