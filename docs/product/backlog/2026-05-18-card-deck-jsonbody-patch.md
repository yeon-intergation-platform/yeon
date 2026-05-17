# 카드덱 PATCH 요청 본문 역직렬화 복구

## 배경

- 로컬/운영 Spring 백엔드에서 카드덱 제목 수정 또는 카드 수정 PATCH 요청 시 `JsonNode` 본문 역직렬화 실패가 발생한다.
- 실패 로그: `Cannot construct instance of com.fasterxml.jackson.databind.JsonNode`.
- Spring Boot 4 / Jackson 3 런타임에서 Spring 메시지 컨버터가 `tools.jackson` 계열을 사용하면서, 컨트롤러가 `com.fasterxml.jackson.databind.JsonNode`를 요청 본문 타입으로 직접 받는 구조가 깨졌다.

## 1차

### 작업내용

- 카드덱/카드 PATCH 컨트롤러 요청 본문 타입을 Jackson 구현 타입이 아닌 `Map<String, Object>` 기반으로 변경한다.
- PATCH 필드 존재 여부(`containsKey`)와 `null` 값 구분을 유지한다.
- 컨트롤러 테스트에 덱 제목 수정, 카드 앞면 수정 PATCH 요청을 추가해 메시지 컨버터 단계에서 실패하지 않음을 보장한다.

### 논의 필요

- 장기적으로 PATCH DTO를 명시적 요청 DTO + presence 처리로 더 정제할지 여부.

### 선택지

1. `tools.jackson.databind.JsonNode`로 타입만 교체한다.
2. `Map<String, Object>`로 런타임 Jackson 구현 타입 의존을 제거한다.
3. 커스텀 deserializer를 추가한다.

### 추천

- 2번. 지금 문제는 특정 Jackson 구현 타입 직접 노출이 원인이므로, 컨트롤러 경계에서는 일반 Java 컬렉션으로 받고 DTO가 PATCH 의미를 해석하게 한다.

### 사용자 방향

- 추천 기준으로 진행한다.
