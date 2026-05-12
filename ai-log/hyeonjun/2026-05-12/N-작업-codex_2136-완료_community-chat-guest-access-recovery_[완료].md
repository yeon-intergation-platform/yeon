# community-chat-guest-access-recovery

- 시작: 2026-05-12 21:36 KST
- 목표: 카드/타자/커뮤니티 실시간 채팅이 chat-service 인증 실패/문구에 의존하지 않고 공개 community-chat으로 비회원 읽기·쓰기를 유지하게 한다.
- 계획:
  - Next BFF 로그인 조회 실패를 게스트 흐름으로 흡수
  - Spring/BFF 오류 메시지 중립화
  - route 테스트 추가
  - web lint/typecheck/build 및 SSOT 검증

## 구현 결과

- Next `/api/v1/community-chat/messages` POST에서 루트 세션 조회 실패를 게스트 전송으로 흡수했다.
- Spring/BFF 오류 메시지가 `chat-service` 로그인 유도 문구로 노출되지 않도록 조회/전송 중립 문구를 반환하게 했다.
- 브라우저 community-chat API에서도 로그인/chat-service 문구를 공개채팅 중립 오류로 정규화했다.
- route 테스트로 비회원 GET/POST, 로그인 POST, 세션 조회 실패 게스트 전환, Spring 오류 중립화를 고정했다.

## 검증

- PASS `pnpm --filter @yeon/web test src/app/api/v1/community-chat/messages/__tests__/route.test.ts`
- PASS `pnpm --filter @yeon/web exec eslint src/app/api/v1/community-chat/messages/route.ts src/app/api/v1/community-chat/messages/__tests__/route.test.ts src/features/community/community-chat-api.ts`
- PASS `pnpm --filter @yeon/web typecheck`
- PASS `pnpm --filter @yeon/web build`
- PASS `rg -n "채팅 서비스 로그인|로그인 후 사용할 수 있습니다|chat-service 로그인이 필요합니다|로그인이 필요" apps/web/src/features/community apps/web/src/app/api/v1/community-chat apps/web/src/app/card-service apps/web/src/app/typing-service --glob '!**/__tests__/**'`
- PASS `./gradlew test --tests 'world.yeon.backend.community_chat.controller.CommunityChatControllerTests'`
- PASS `git diff --check`
- PASS `bash bin/sync-skills.sh --check`
- PASS `bash bin/verify-ssot.sh --project-only`
- NOTE `pnpm --filter @yeon/web lint` 전체는 다른 작업의 dirty `apps/web/src/features/community/community-page.tsx:737` no-restricted-syntax 위반으로 실패했다. 이번 소유 파일 대상 eslint는 통과했다.
