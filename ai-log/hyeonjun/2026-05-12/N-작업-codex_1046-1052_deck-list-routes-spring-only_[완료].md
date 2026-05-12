# deck list routes Spring-only cutover 작업 로그

- 목표: card-decks/typing-decks list route의 Next DB fallback을 제거해 Spring-only 호출 경계로 줄인다.
- 범위: `apps/web/src/app/api/v1/card-decks/route.ts`, `apps/web/src/app/api/v1/typing-decks/route.ts`, 관련 route tests.

## 결과

- `/api/v1/card-decks` GET의 Spring 실패 시 Next DB fallback을 제거하고 Spring error/status를 그대로 반환하게 했다.
- `/api/v1/typing-decks` GET의 Spring 실패 시 Next DB fallback을 제거하고 Spring error/status를 그대로 반환하게 했다.
- 기본 타자 덱(`scope=default`) 정적 응답은 DB 소유권이 아니므로 유지했다.
- fallback 없이 Spring 실패를 전달하는 route 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/card-decks/__tests__/route.test.ts src/app/api/v1/typing-decks/__tests__/spring-route.test.ts src/app/api/v1/typing-decks/__tests__/route.test.ts`
- `./gradlew test --tests world.yeon.backend.card_decks.route.controller.CardDeckRouteControllerTests --tests world.yeon.backend.typing_decks.controller.TypingDeckControllerTests`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
