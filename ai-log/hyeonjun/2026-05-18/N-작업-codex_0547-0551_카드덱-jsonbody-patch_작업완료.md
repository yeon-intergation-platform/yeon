# 카드덱 JSON 본문 PATCH 복구 작업 로그

## 목표

- 카드덱 제목 수정/카드 수정 PATCH 요청이 Spring 백엔드에서 `JsonNode` 역직렬화 오류로 실패하는 문제를 복구한다.

## 근거

- 로컬 로그: `HttpMessageConversionException: Type definition error: [simple type, class com.fasterxml.jackson.databind.JsonNode]`.
- 요청 바인딩 단계에서 실패하므로 서비스 로직 이전 컨트롤러 본문 타입 문제가 1차 원인이다.

## 계획

1. `CardDeckRouteController` PATCH 본문 타입 제거.
2. PATCH DTO를 `Map<String, Object>` 기반으로 변경.
3. MockMvc 테스트로 덱/카드 PATCH 바인딩 성공 검증.
4. 백엔드 테스트와 diff check 후 PR로 main 병합.

## 결과

- `JsonNode` 직접 바인딩을 제거하고 `Map<String, Object>` 기반 PATCH DTO로 변경했다.
- 덱 PATCH와 카드 아이템 PATCH MockMvc 테스트를 추가했다.
- `./gradlew test --tests 'world.yeon.backend.card_decks.route.controller.CardDeckRouteControllerTests'` 통과.
- `./gradlew test` 통과.
- `git diff --check` 통과.
