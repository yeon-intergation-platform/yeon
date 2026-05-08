# Spring Member Tabs Read API Contract

## 문서 목적
- `member-tabs` 1차 파일럿(read-only)의
  **Next BFF ↔ Spring backend 내부 계약**을 고정한다.
- 이 문서는 외부 사용자용 public API 문서가 아니라
  **migration 내부 계약 SSOT**다.

## 계약 레이어 구분

### 1. 프론트가 계속 호출하는 outward contract
- `GET /api/v1/spaces/{spaceId}/member-tabs`

이 route는 계속 Next가 소유한다.

### 2. Next BFF가 호출할 Spring internal contract
- `GET /spaces/{spaceId}/member-tabs`

이 route는 `apps/backend`가 새로 제공한다.

## 왜 contract를 분리하나
1. 프론트 회귀를 막기 위해 outward path를 유지해야 한다.
2. Spring은 사용자 브라우저가 아니라 **Next trusted caller**를 상대한다.
3. 인증 source of truth가 아직 Next에 있으므로,
   내부 hop 계약을 따로 두는 편이 안전하다.

## Spring internal endpoint contract

## 1) 스페이스 탭 목록 조회

### Endpoint
- `GET /spaces/{spaceId}/member-tabs`

### Path params
- `spaceId: string`

### Request headers
- required:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- optional:
  - `X-Yeon-Request-Id`

### Query params
- 없음

### 의미
- 호출 주체는 Next BFF다.
- `X-Yeon-User-Id`는 Next가 인증한 현재 사용자 식별자다.
- 1차 read 단계에서 Spring은 이 header를 **trusted internal caller가 넘긴 현재 사용자 정보**로 취급한다.
- 1차에서는 탭 목록 조회만 담당하며, **system tab/backfill write는 수행하지 않는다.**

### Success response
- `200 OK`

```json
{
  "tabs": [
    {
      "id": "mtb_overview",
      "name": "개요",
      "tabType": "system",
      "systemKey": "overview",
      "isVisible": true,
      "displayOrder": 0
    },
    {
      "id": "mtb_custom",
      "name": "상담 메모",
      "tabType": "custom",
      "systemKey": null,
      "isVisible": true,
      "displayOrder": 1
    }
  ]
}
```

### 응답 필드 규칙
- `id`: member tab public id
- `name`: 사용자 표시 이름
- `tabType`: `system | custom`
- `systemKey`: 시스템 탭이면 key, 아니면 `null`
- `isVisible`: 현재 표시 여부
- `displayOrder`: 오름차순 정렬 기준

### Error response
- `400 Bad Request`
  - `spaceId` 형식 오류
  - required header 누락/형식 오류
- `404 Not Found`
  - 스페이스 없음
- `500 Internal Server Error`
  - backend query/mapping 실패

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

### 목록 응답 shape
- `{ "tabs": MemberTabItem[] }`

### 1차에서 포함하지 않는 것
- field summary
- synthetic `student_board` tab 보정
- lazy backfill 결과에 따른 write side effect

## Error shape 규칙

### Spring internal contract 기본 shape
```json
{
  "code": "SPACE_NOT_FOUND",
  "message": "스페이스를 찾지 못했습니다."
}
```

### 1차 원칙
- Spring 내부에선 top-level `code`, `message`를 사용한다.
- Next outward route는 필요하면 기존 `jsonError` shape로 다시 변환한다.

## Error code 초안
- `INVALID_USER_HEADER`
- `INVALID_INTERNAL_TOKEN`
- `INVALID_SPACE_ID`
- `SPACE_NOT_FOUND`
- `MEMBER_TAB_LIST_FAILED`

## Next BFF translation 규칙

### Next route
- `GET /api/v1/spaces/{spaceId}/member-tabs`

### 동작
1. `requireAuthenticatedUser`
2. 현재 user id 추출
3. Spring `GET /spaces/{spaceId}/member-tabs` 호출
4. 응답 body를 outward `{ tabs }`로 그대로 반환
5. Spring error를 `jsonError`로 번역

### lazy backfill 처리 원칙
- 1차 cutover 시점에는 **Next route의 기존 lazy backfill을 제거하는 방향**을 기본값으로 둔다.
- 이유:
  1. Spring read source of truth와 Next BFF 동작을 일치시키기 위해
  2. read 요청이 write를 유발하지 않게 하기 위해
- 단, 실제 UI 회귀가 확인되면 별도 bootstrap/write lane backlog로 backfill을 분리한다.

## 1차 비목표
- POST/PATCH/DELETE/reset/reorder contract 정의 금지
- `/fields` route contract 정의 금지
- 브라우저 직접 호출용 auth scheme 정의 금지
- OpenAPI 전면 작성 금지

## 검증 목표
- backend contract test
  - header required
  - `GET /spaces/{spaceId}/member-tabs` 200/404
  - error shape 고정
- web BFF test
  - Next route가 header를 정확히 전달하는지
  - outward response shape가 유지되는지
  - lazy backfill 제거 후 회귀가 없는지 확인

## 다음 1작업 추천
- 다음엔
  **`apps/backend` 실제 `member-tabs` read skeleton 파일 생성 계획 문서 1개**
  만 만들고 멈춘다.
