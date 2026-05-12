# 커뮤니티 피드 컴포넌트 분리

## 목표

- `community-page.tsx`의 인라인 presentational 컴포넌트를 feature component 파일로 분리한다.
- 동작 변경 없이 컨테이너/뷰 책임을 나눈다.

## 변경

- `components/community-feed-components.tsx`를 추가했다.
- 피드 guest identity row, 게시글 카드, 댓글 폼/아이템, 글쓰기 패널을 새 component 파일로 이동했다.
- `community-page.tsx`는 feed hook 연결, 카테고리 필터, 작성 상태, guest identity confirm orchestration만 담당하게 줄였다.
- UI 문구/마크업/이벤트 흐름은 변경하지 않았다.

## 검증

- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
