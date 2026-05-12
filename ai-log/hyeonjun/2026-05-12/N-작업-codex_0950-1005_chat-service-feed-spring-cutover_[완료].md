# chat-service feed Spring cutover 작업 로그

- 목표: Next route의 feed 목록/작성/답글 목록/작성 DB 비즈니스 호출을 Spring client 호출로 축소한다.
- 범위: `apps/web/src/app/api/v1/chat-service/feed/**`, `apps/web/src/server/chat-service-feed-spring-client.ts`, `apps/backend/.../chat_service_feed/**`.
- 제외: 글/답글 수정·삭제 Spring 신규 API 추가는 다음 차수.
- 검증 예정: web 관련 vitest, backend 테스트, web typecheck/build.

## 결과
- feed 목록/작성과 답글 목록/작성을 Spring client 경유로 전환했다.
- Spring feed 목록 조회는 비로그인 프로필 헤더 없이도 동작하도록 맞췄다.
- 수정/삭제는 Spring API 추가가 필요한 다음 차수로 남겼다.

## 검증
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/chat-service/feed/__tests__/route.test.ts 'src/app/api/v1/chat-service/feed/[postId]/replies/__tests__/route.test.ts'` 통과
- `./gradlew test --tests world.yeon.backend.chat_service_feed.controller.ChatServiceFeedControllerTests` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과

## 참고
- 처음 실행한 `pnpm --filter @yeon/web test -- ...`는 인자 전달 방식 때문에 전체 web test가 실행되어 기존 unrelated 실패가 다수 노출되어 중단했다. 이후 `pnpm --filter @yeon/web exec vitest run ...`로 범위 테스트를 통과시켰다.
