# chat-service auth routes Spring cutover 작업 로그

- 목표: chat-service auth request/verify/session route의 Next auth-service 직접 호출을 Spring client로 전환한다.
- 범위: web auth route 3개, `chat-service-auth-spring-client.ts`, route tests.

## 결과

- `/api/v1/chat-service/auth/request-otp` route를 Spring client 호출로 전환했다.
- `/api/v1/chat-service/auth/verify-otp` route를 Spring client 호출로 전환하고, session cookie 설정은 Next BFF bridge 책임으로 유지했다.
- `/api/v1/chat-service/auth/session` GET/DELETE route를 Spring client 호출로 전환하고, session cookie 삭제는 Next BFF bridge 책임으로 유지했다.
- `_shared`의 route-level session cookie 상수는 로컬 BFF 상수로 남기고, legacy session 조회 helper는 다음 차수 범위로 남겼다.
- route 테스트 3개를 추가해 Spring client mapping, cookie bridge, 에러 전달을 검증했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/chat-service/auth/request-otp/__tests__/route.test.ts src/app/api/v1/chat-service/auth/verify-otp/__tests__/route.test.ts src/app/api/v1/chat-service/auth/session/__tests__/route.test.ts`
- `./gradlew test --tests world.yeon.backend.chat_service_auth.controller.ChatServiceAuthControllerTests`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
