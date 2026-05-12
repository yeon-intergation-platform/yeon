# 커뮤니티 실시간 채팅 widget view 분리

## 목표

- 커뮤니티 채팅 widget 파일의 view 책임을 분리한다.
- 익명 채팅 표시/전송 동작은 유지한다.

## 계획

1. formatter, header, message list, form component를 분리한다.
2. widget container는 hook, collapse animation state, submit orchestration을 유지한다.
3. web typecheck/lint/build 및 docs/rules 검증을 수행한다.

## 진행

- 작업 시작.

## 완료

- `community-chat-format.ts` 추가: 메시지 시간/본문 표시 formatter 분리.
- `community-chat-header.tsx` 추가: 기본/feed/compact header와 접속자 표시 분리.
- `community-chat-message-list.tsx` 추가: 로딩/오류/빈 상태/메시지 list view 분리.
- `community-chat-form.tsx` 추가: 메시지 입력/전송 form 분리.
- `community-chat-widget.tsx`는 hook, collapse animation state, submit/focus orchestration 중심으로 축소.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `git diff --check` 성공.
- `bash bin/sync-skills.sh --check` 성공.
- `bash bin/verify-ssot.sh --project-only` 성공.
