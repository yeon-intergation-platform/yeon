# 에러 응답 계약: 공통 최소(code/message) + 선택 확장 메타데이터 구조로 개선

## 배경

- `errorResponseSchema`(`packages/api-contract/src/error.ts`)가 `{ message }`뿐 — 프론트가 분기할 `code`조차 없었다.
- 백엔드(Spring)는 이미 `record ErrorResponse(String code, String message)` 평면 구조로 code를 일관 제공하지만, Web BFF 헬퍼(`jsonError`/`jsonChatServiceError`)와 `ServiceError`/`ApiClientError`/`parseErrorResponse`가 code를 버려 클라이언트까지 도달하지 못했다.

## 설계 원칙

- `code`/`message`가 기본 계약, 나머지(`details`/`currentState`/`requiredState`/`failedCondition`/`blockedAction`/`actionGuide`)는 **에러 유형별 선택 메타데이터**. 모든 필드를 강제하지 않는다(단순 장애에 상태전이 필드 억지 금지).
- code는 호환 위해 **optional 점진 도입** → 동결 counseling 등 기존 코드 무수정.

## 변경

### 코어 계약/인프라

- `packages/api-contract/src/error.ts`: `code` optional + 확장 6필드 optional 추가. `message` 필수 유지(하위호환). `ErrorResponseMeta` 보조 타입(= `Omit<ErrorResponse,"message">`) export.
- `packages/api-client/src/index.ts`: `ApiClientError`에 `code`/`detail` 추가. `parseErrorResponse`가 전체 `ErrorResponse` 반환, `toApiClientError`가 message/메타 분리. → **api-client 경로는 백엔드 code를 자동 수신**(추가 도메인 작업 불필요).
- `apps/web/src/server/errors/service-error.ts`: `ServiceError`에 `detail?: ErrorResponseMeta` 추가(객체 1개로 확장, 기존 호출 호환).

### BFF 개통 (유지보수 3종)

- `chat-service/_shared.ts`: `jsonChatServiceError(message, status, detail?)` 확장. `requireChatServiceAuth`→`CHAT_SERVICE_AUTH_REQUIRED`, `parseJsonBody`→`INVALID_JSON_BODY` code 부여.
- chat-service 18개 route: catch의 **`error instanceof ServiceError` 분기에만** `error.detail` 전달(Spring 백엔드 에러 분기·fallback은 보존).
- `card-decks/merge-guest`, `community-chat/messages`: `jsonError` 시그니처 detail 확장 + ServiceError 분기 detail 전달.

## 검증

- `pnpm --filter @yeon/api-contract test` 65/65 통과(신규 `error.test.ts` 5케이스: 하위호환·기본형·확장필드 전수·필수/타입 거부).
- typecheck exit 0: api-contract / api-client / web / **mobile(계약 공용 영향 없음)**.
- lint exit 0: web / api-contract / api-client.
- chat/rooms diff로 ServiceError 분기만 변경, Spring 분기 보존 확인.

## 범위 밖(후속)

- 백엔드 HTTP 에러 중계(`XxxSpringBackendHttpError`)의 code 보존은 도메인별 spring-client 다수 수정이 필요 → 별도 작업.
- 프론트 features의 `error.code` 분기 소비도 점진 적용.
- 동결 counseling / life-os / content는 미수정(code optional이라 그대로 동작).
