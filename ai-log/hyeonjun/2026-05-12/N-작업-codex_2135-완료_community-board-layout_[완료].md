# community board layout 작업 로그

## 목표

- `/community`를 흰 배경 게시판형 UI로 정리한다.
- 트위터형 탭/사이드바/목데이터 지표를 제거한다.
- 채팅/게시글/댓글 API 동작은 유지한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- `pnpm --filter @yeon/web build`

## 진행

- 작업 시작.
- `/community` 메타데이터를 게시판 문구로 정리.
- `CommunityPage`를 단일 중앙 컬럼 게시판형으로 재구성.
- 트위터형 탭/사이드바/리포스트/좋아요/조회수/북마크/공유/핸들/아바타 표시 제거.
- 채팅 feed variant 헤더를 `접속 N명`으로 바꾸고 빈 상태 문구를 추가.
- 검증 통과: `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `git diff --check`, `pnpm --filter @yeon/web build`.
