# Spring Member Tabs Write API Contract

## 문서 목적
- `member-tabs` 1차 write 파일럿(create/update/delete)의
  **Next BFF ↔ Spring backend 내부 계약**을 고정한다.
- 이 문서는 외부 사용자용 public API 문서가 아니라
  **migration 내부 계약 SSOT**다.

## 계약 레이어 구분

### 1. 프론트가 계속 호출하는 outward contract
- `POST /api/v1/spaces/{spaceId}/member-tabs`
- `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
- `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}`

이 route들은 계속 Next가 소유한다.

### 2. Next BFF가 호출할 Spring internal contract
- `POST /spaces/{spaceId}/member-tabs`
- `PATCH /spaces/{spaceId}/member-tabs/{tabId}`
- `DELETE /spaces/{spaceId}/member-tabs/{tabId}`

이 route들은 `apps/backend`가 새로 제공한다.

## 왜 contract를 분리하나
1. 프론트 회귀를 막기 위해 outward path를 유지해야 한다.
2. Spring은 사용자 브라우저가 아니라 **Next trusted caller**를 상대한다.
3. 인증 source of truth가 아직 Next에 있으므로, 내부 hop 계약을 따로 두는 편이 안전하다.

## Spring internal endpoint contract

## 1) 커스텀 탭 생성

### Endpoint
- `POST /spaces/{spaceId}/member-tabs`

### Path params
- `spaceId: string`

### Request headers
- required:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- optional:
  - `X-Yeon-Request-Id`

### Request body
```json
{
  "name": "상담 메모"
}
```

### 규칙
- `name` trim 후 80자 제한
- 빈 문자열 불가
- 생성 결과는 `tabType = custom`, `systemKey = null`, `isVisible = true`
- `displayOrder = max(existing) + 1`

### Success response
- `201 Created`

```json
{
  "tab": {
    "id": "mtb_new",
    "name": "상담 메모",
    "tabType": "custom",
    "systemKey": null,
    "isVisible": true,
    "displayOrder": 5
  }
}
```

## 2) 탭 수정

### Endpoint
- `PATCH /spaces/{spaceId}/member-tabs/{tabId}`

### Path params
- `spaceId: string`
- `tabId: string`

### Request headers
- required:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`

### Request body
```json
{
  "name": "새 이름",
  "isVisible": false,
  "displayOrder": 2
}
```

### 규칙
- protected system key면 403
- 이름 변경 시 trim + 80자 제한 + 빈 문자열 불가
- patch에 포함된 필드만 반영

### Success response
- `200 OK`

```json
{
  "tab": {
    "id": "mtb_existing",
    "name": "새 이름",
    "tabType": "custom",
    "systemKey": null,
    "isVisible": false,
    "displayOrder": 2
  }
}
```

## 3) 커스텀 탭 삭제

### Endpoint
- `DELETE /spaces/{spaceId}/member-tabs/{tabId}`

### Path params
- `spaceId: string`
- `tabId: string`

### Request headers
- required:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`

### 규칙
- protected system key면 403
- `tabType = system`이면 403
- custom tab만 삭제 허용
- 성공 시 body 없음

### Success response
- `204 No Content`

## Header contract

### `X-Yeon-User-Id`
- 의미:
  - Next가 이미 인증한 사용자 식별자
- 소유자:
  - Next BFF
- 소비자:
  - Spring backend

### `X-Yeon-Internal-Token`
- 의미:
  - Next → Spring internal trusted hop 인증
- 소유자:
  - server-only env
- 소비자:
  - Spring security/internal filter

### 1차 규칙
- 두 header 모두 브라우저 public contract로 문서화하지 않는다.
- 외부 클라이언트가 직접 보내는 입력으로 신뢰하지 않는다.
- ingress/edge에서 직접 노출하는 API로 쓰지 않는다.

## Response shape 규칙

### 원칙
- Spring response shape는 **Next outward contract와 동일 구조**를 목표로 한다.
- 이유:
  - Next route에서 변환 로직을 최소화하기 위해
  - contract diff를 줄이기 위해

### create/update
- `{ "tab": MemberTabItem }`

### delete
- `204 No Content`

## Error shape 규칙

### Spring internal contract 기본 shape
```json
{
  "code": "PROTECTED_SYSTEM_TAB",
  "message": "기본 탭은 수정할 수 없습니다."
}
```

### 1차 원칙
- Spring 내부에선 top-level `code`, `message`를 사용한다.
- Next outward route는 필요하면 기존 `jsonError` shape로 다시 변환한다.

## Error code 초안
- `INVALID_USER_HEADER`
- `INVALID_INTERNAL_TOKEN`
- `INVALID_SPACE_ID`
- `INVALID_TAB_ID`
- `INVALID_REQUEST`
- `SPACE_NOT_FOUND`
- `MEMBER_TAB_NOT_FOUND`
- `PROTECTED_SYSTEM_TAB`
- `SYSTEM_TAB_DELETE_FORBIDDEN`
- `MEMBER_TAB_CREATE_FAILED`
- `MEMBER_TAB_UPDATE_FAILED`
- `MEMBER_TAB_DELETE_FAILED`

## Next BFF translation 규칙

### create route
- `POST /api/v1/spaces/{spaceId}/member-tabs`
- 동작:
  1. `requireAuthenticatedUser`
  2. zod body validation
  3. Spring `POST /spaces/{spaceId}/member-tabs` 호출
  4. 응답 body를 outward `{ tab }`로 그대로 반환
  5. Spring error를 `jsonError`로 번역

### update route
- `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
- 동작:
  1. `requireAuthenticatedUser`
  2. zod body validation
  3. Spring `PATCH /spaces/{spaceId}/member-tabs/{tabId}` 호출
  4. 응답 body를 outward `{ tab }`로 그대로 반환
  5. Spring error를 `jsonError`로 번역

### delete route
- `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
- 동작:
  1. `requireAuthenticatedUser`
  2. Spring `DELETE /spaces/{spaceId}/member-tabs/{tabId}` 호출
  3. `204`를 그대로 반환
  4. Spring error를 `jsonError`로 번역

## 1차 비목표
- reorder/reset contract 정의 금지
- `/fields` route contract 정의 금지
- 브라우저 직접 호출용 auth scheme 정의 금지
- OpenAPI 전면 작성 금지

## 검증 목표
- backend contract test
  - create 201
  - update 200
  - delete 204
  - protected/system 403
  - not found 404
- web BFF test
  - Next route가 header를 정확히 전달하는지
  - outward response shape가 유지되는지
  - delete 204를 유지하는지

## 다음 1작업 추천
- 다음엔
  **`apps/backend` 실제 `member-tabs` write skeleton 파일 생성 계획 문서 1개**
  만 만들고 멈춘다.
