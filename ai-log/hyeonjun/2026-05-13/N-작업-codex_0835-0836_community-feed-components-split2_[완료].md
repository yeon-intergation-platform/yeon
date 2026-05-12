# 커뮤니티 feed component 역할 분리

## 목표

- 커뮤니티 영역의 대형 component 파일을 표준 구조에 맞게 역할별로 분리한다.
- 기존 `community-page.tsx` import 경로와 feed 동작은 유지한다.

## 계획

1. category/time formatter, form, reply item, post item 파일을 분리한다.
2. `community-feed-components.tsx`는 re-export bridge로 축소한다.
3. web typecheck/lint/build 및 docs/rules 검증을 수행한다.

## 진행

- 작업 시작.

## 완료

- `community-feed-meta.tsx` 추가: 카테고리 badge와 상대 시간 표시 분리.
- `community-feed-forms.tsx` 추가: guest identity row, 게시글 수정 form, 댓글 form, 글쓰기 panel 분리.
- `community-feed-reply-item.tsx` 추가: 댓글 item view 분리.
- `community-feed-post-item.tsx` 추가: 게시글 카드/수정/댓글 orchestration view 분리.
- `community-feed-components.tsx`는 기존 호출부를 위한 re-export bridge로 축소.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `git diff --check` 성공.
- `bash bin/sync-skills.sh --check` 성공.
- `bash bin/verify-ssot.sh --project-only` 성공.
