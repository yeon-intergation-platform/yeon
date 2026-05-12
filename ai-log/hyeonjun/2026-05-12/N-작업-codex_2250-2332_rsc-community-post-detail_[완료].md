# RSC/SSR 커뮤니티 글 상세 1차 구현

## 목표

`rsc-ssr-loading-boundary-20260512.md` 백로그 1차를 시작한다. 공개 커뮤니티 글 상세의 제목/본문/작성자/작성일을 서버 초기 HTML에 포함하고, 댓글/수정/삭제 상호작용은 client island로 유지한다.

## 구현

- Spring `GET /chat-service/feed/{postId}` 상세 조회 API를 추가했다.
  - 답글 ID를 상세 글로 직접 조회하지 않도록 차단한다.
  - 차단 관계가 있으면 상세 글도 404로 숨긴다.
  - 상세 응답에 실제 replyCount를 포함한다.
- web Spring client와 Next BFF `GET /api/v1/chat-service/feed/[postId]`를 얇게 연결했다.
- `/community/posts/[postId]` route를 서버 상세 조회 기반으로 전환했다.
  - `generateMetadata`에서 제목/설명/OG/Twitter 메타를 글 내용 기준으로 만든다.
  - 초기 렌더에 상세 post를 주입해 제목/본문/작성자/작성일이 초기 HTML 경로에 포함된다.
  - 댓글/수정/삭제는 기존 client island에서 유지한다.
- 커뮤니티 글 body 파싱/직렬화 로직을 `community-post-format.ts`로 분리해 서버 route와 클라이언트 페이지가 같은 규칙을 쓴다.
- 상세 화면에서 글 수정/삭제/댓글 증감 후 전체 feed list를 다시 가져오지 않고 현재 post 상태를 직접 갱신하도록 좁혔다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/chat-service/feed/'[postId]'/__tests__/route.test.ts` ✅
- `cd apps/backend && ./gradlew test --tests '*ChatServiceFeedControllerTests'` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm lint` ✅
- `pnpm --filter @yeon/web build` ✅
- `pnpm typecheck` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
