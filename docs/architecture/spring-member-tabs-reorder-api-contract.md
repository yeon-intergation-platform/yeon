# Spring Member Tabs Reorder API Contract

## 문서 목적
- `member-tabs` bulk mutation 중 **reorder lane만 먼저** 옮길 때의
  **Next BFF ↔ Spring backend 내부 계약**을 고정한다.
- 이 문서는 외부 사용자용 public API 문서가 아니라
  **migration 내부 계약 SSOT**다.

## 계약 레이어 구분

### 1. 프론트가 계속 호출하는 outward contract
- `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`

이 route는 계속 Next가 소유한다.

### 2. Next BFF가 호출할 Spring internal contract
- `PATCH /spaces/{spaceId}/member-tabs/reorder`

이 route는 `apps/backend`가 새로 제공한다.

## 왜 contract를 분리하나
1. 프론트 회귀를 막기 위해 outward path를 유지해야 한다.
2. Spring은 브라우저가 아니라 **Next trusted caller**를 상대한다.
3. 인증 source of truth가 아직 Next에 있으므로 내부 hop 계약을 따로 두는 편이 안전하다.

## Spring internal endpoint contract

## 1) 탭 순서 일괄 변경

### Endpoint
- `PATCH /spaces/{spaceId}/member-tabs/reorder`

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
  "order": ["mtb_overview", "mtb_custom_notes", "mtb_custom_hidden"]
}
```

### 규칙
- `spaceId` → internal bigint id 해석 필요
- 배열 index를 그대로 새 `displayOrder`로 사용
- 1차에서는 Next 현재 동작과 동일하게
  - order 배열의 완전성 추가 검증 없음
  - 중복 여부 추가 검증 없음
  - 존재하지 않는 `tabPublicId`가 섞여도 별도 404 없음
- 전체 mutation은 하나의 transaction 안에서 처리한다.

### Success response
- `200 OK`

```json
{
  "ok": true
}
```

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

### reorder success
- `{ "ok": true }`

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
- Next outward route는 기존 `jsonError` shape로 다시 변환한다.

## Error code 초안
- `INVALID_USER_HEADER`
- `INVALID_INTERNAL_TOKEN`
- `INVALID_SPACE_ID`
- `INVALID_REQUEST`
- `SPACE_NOT_FOUND`
- `MEMBER_TAB_REORDER_FAILED`

## Next BFF translation 규칙

### reorder route
- `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`
- 동작:
  1. `requireAuthenticatedUser`
  2. zod body validation (`reorderMemberTabsBodySchema`)
  3. Spring `PATCH /spaces/{spaceId}/member-tabs/reorder` 호출
  4. 응답 body를 outward `{ ok: true }`로 그대로 반환
  5. Spring error를 `jsonError`로 번역

## 1차 비목표
- reset contract 동시 정의 금지
- order 배열 완전성/중복성 정책 강화 동시 반영 금지
- `fields` reorder contract 혼합 금지
- auth/session migration 동시 진행 금지

## 다음 1작업 추천
- 다음엔
  **`member-tabs reorder` skeleton file plan 문서 1개**
  만 만들고 멈춘다.
