# chat-service guest profile Spring cutover 작업 로그

- 목표: feed route에 남은 `getOrCreateChatServiceGuestProfile` 직접 DB 소유권을 Spring auth endpoint로 이전한다.
- 범위: Spring chat_service_auth, web chat-service-auth Spring client, feed route actor resolution.

## 결과
- Spring auth에 guest profile resolve endpoint를 추가했다.
- 기존 guest key 생성 규칙과 익명 기본 프로필 값을 유지했다.
- feed route의 게스트 profile 생성/조회 직접 DB 호출을 Spring client로 교체했다.

## 검증
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/chat-service/feed/__tests__/route.test.ts 'src/app/api/v1/chat-service/feed/[postId]/__tests__/route.test.ts' 'src/app/api/v1/chat-service/feed/[postId]/replies/__tests__/route.test.ts'` 통과
- `./gradlew test --tests world.yeon.backend.chat_service_auth.controller.ChatServiceAuthControllerTests --tests world.yeon.backend.chat_service_feed.controller.ChatServiceFeedControllerTests` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과

## 참고
- 루트에서 `./gradlew ...`를 한 번 실행해 경로 오류가 났고, `apps/backend`에서 재실행해 통과했다.
