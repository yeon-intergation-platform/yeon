# Community Chat Public Spring Access

## 목표
카드/타자/커뮤니티 실시간 채팅이 Spring 보안에서 인증 없이 GET/POST 가능하도록 복구한다.

## 원인
`CommunityChatController`의 user header는 optional이지만, `SecurityConfig`의 `.anyRequest().authenticated()`가 `/api/v1/community-chat/messages`도 막고 있다.

## 진행
- 백로그 작성 완료
- Spring Security permitAll 및 테스트 보강 예정

## 완료
- Spring Security에서 `/api/v1/community-chat/messages` GET/POST를 `permitAll` 처리했다.
- 컨트롤러 테스트를 내부 토큰 없이 통과하도록 보강했다.
- SecurityConfig 통합 테스트에 공개 조회/전송 smoke를 추가했다.

## 검증
- `./gradlew test --tests world.yeon.backend.community_chat.controller.CommunityChatControllerTests --tests world.yeon.backend.config.SecurityConfigTests`
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/community-chat/messages/__tests__/route.test.ts`
- `git diff --check -- <owned files>`
- `bash bin/verify-ssot.sh --project-only`
- `bash bin/sync-skills.sh --check`
