# community-public-chat-guest

- 시작: 2026-05-12 20:37 KST
- 목표: 운영 커뮤니티 실시간 채팅의 chat-service 로그인 의존 오류를 제거하고 비회원/루트 로그인 사용자 모두 채팅 가능하게 수정한다.
- 원인 가설: 커뮤니티 채팅 위젯이 공개 채팅이 아니라 chat-service OTP 세션 + 1:1 채팅방 목록을 읽어 로그인 오류를 노출한다.
- 진행: Spring 공개 커뮤니티 채팅 API + Next BFF + 웹 훅 전환으로 수정한다.

## 구현 결과

- `useCommunityChat`에서 chat-service OTP 세션/1:1 방 목록 의존을 제거했다.
- Spring `/api/v1/community-chat/messages`를 공개 커뮤니티 채팅 메시지 SSOT로 추가했다.
- Next BFF `/api/v1/community-chat/messages`는 루트 로그인 사용자를 optional로 전달하고 비회원은 게스트 세션으로 전송한다.
- UI는 메시지 작성자 닉네임을 서버 메시지 상태에서 표시한다.

## 검증

- PASS `pnpm --filter @yeon/api-contract typecheck`
- PASS `pnpm --filter @yeon/web typecheck`
- PASS `pnpm --filter @yeon/api-contract lint`
- PASS `pnpm --filter @yeon/web lint`
- PASS `pnpm --filter @yeon/web build`
- PASS `./gradlew test --tests 'world.yeon.backend.community_chat.controller.CommunityChatControllerTests'`
- PASS `git diff --check`
- NOTE `./gradlew test` 전체는 main의 기존 `localImportAnalysisRepository` ObjectMapper bean 누락으로 47개 실패했다. 이번 변경 대상 테스트는 통과했다.
