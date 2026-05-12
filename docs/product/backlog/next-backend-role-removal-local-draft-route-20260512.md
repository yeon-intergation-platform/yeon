# Next 백엔드 역할 제거 — 로컬 import draft 단건 route 정리

## 배경

`integrations/local/drafts/[draftId]` route는 조회/수정/삭제 자체는 이미 Spring client를 호출하지만, PATCH 요청 검증 스키마만 legacy `@/server/services/import-preview-service`에서 가져와 `api/v1` backend-role import 잔여 목록에 남아 있다.

## 1차 — route-local 검증으로 service import 제거

### 작업내용

- `apps/web/src/app/api/v1/integrations/local/drafts/[draftId]/route.ts`에서 `@/server/services/import-preview-service` import를 제거한다.
- PATCH body 검증은 route-local Zod schema로 고정한다.
- Spring 호출 경계(`import-drafts-spring-client`)는 유지한다.

### 논의 필요

- import preview schema의 장기 SSOT를 `packages/api-contract`로 승격할지 여부.

### 선택지

1. 이번 PR은 route-local schema로 import 제거만 수행한다.
2. shared contract package로 schema를 승격하고 legacy service도 함께 바꾼다.

### 추천

- 1번. backend-role import 제거를 작은 PR로 완료하고, contract 승격은 별도 차수에서 수행한다.

### 사용자 방향
