# Spring Member Tabs Reset API Contract

## 문서 목적
- `member-tabs` bulk mutation 중 **reset lane만 먼저** 옮길 때의
  **Next BFF ↔ Spring backend 내부 계약**을 고정한다.
- 이 문서는 외부 사용자용 public API 문서가 아니라
  **migration 내부 계약 SSOT**다.

## 계약 레이어 구분

### 1. 프론트가 계속 호출하는 outward contract
- `POST /api/v1/spaces/{spaceId}/member-tabs/reset`

이 route는 계속 Next가 소유한다.

### 2. Next BFF가 호출할 Spring internal contract
- `POST /spaces/{spaceId}/member-tabs/reset`

이 route는 `apps/backend`가 새로 제공한다.

## 왜 contract를 분리하나
1. 프론트 회귀를 막기 위해 outward path를 유지해야 한다.
2. Spring은 브라우저가 아니라 **Next trusted caller**를 상대한다.
3. 인증 source of truth가 아직 Next에 있으므로 내부 hop 계약을 따로 두는 편이 안전하다.

## Spring internal endpoint contract

## 1) 스페이스 탭 구성을 기본값으로 초기화

### Endpoint
- `POST /spaces/{spaceId}/member-tabs/reset`

### Path params
- `spaceId: string`

### Request headers
- required:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- optional:
  - `X-Yeon-Request-Id`

### Request body
- 없음

### 규칙
- `spaceId` → internal bigint id 해석 필요
- `tabType != system`인 custom tab을 전부 삭제한다.
- custom tab에 연결된 `member_field_definitions`는 FK cascade로 함께 삭제된다.
- 이후 기본 system tab 5개의
  - `name`
  - `displayOrder`
  - `isVisible = true`
  - `updatedAt`
  을 원상복구한다.
- 1차에서는 Next 현재 동작과 동일하게
  - system tab row가 없으면 새로 생성하지 않음
  - existing row update만 수행함
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

### reset success
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
- `SPACE_NOT_FOUND`
- `MEMBER_TAB_RESET_FAILED`

## Next BFF translation 규칙

### reset route
- `POST /api/v1/spaces/{spaceId}/member-tabs/reset`
- 동작:
  1. `requireAuthenticatedUser`
  2. Spring `POST /spaces/{spaceId}/member-tabs/reset` 호출
  3. 응답 body를 outward `{ ok: true }`로 그대로 반환
  4. Spring error를 `jsonError`로 번역

## 1차 비목표
- reorder contract 재정의 금지
- missing system tab 자동 생성 정책 추가 금지
- `fields` reset contract 혼합 금지
- auth/session migration 동시 진행 금지

## 다음 1작업 추천
- 다음엔
  **`member-tabs reset` skeleton file plan 문서 1개**
  만 만들고 멈춘다.
