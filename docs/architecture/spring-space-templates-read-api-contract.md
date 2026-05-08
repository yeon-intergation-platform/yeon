# Spring Space Templates Read API Contract

## 문서 목적
- `space-templates` 1차 파일럿(read-only)의
  **Next BFF ↔ Spring backend 내부 계약**을 고정한다.
- 이 문서는 외부 사용자용 public API 문서가 아니라
  **migration 내부 계약 SSOT**다.

## 계약 레이어 구분

### 1. 프론트가 계속 호출하는 outward contract
- `GET /api/v1/space-templates`
- `GET /api/v1/space-templates/{templateId}`

이 두 route는 계속 Next가 소유한다.

### 2. Next BFF가 호출할 Spring internal contract
- `GET /space-templates`
- `GET /space-templates/{templateId}`

이 두 route는 `apps/backend`가 새로 제공한다.

## 왜 contract를 분리하나
1. 프론트 회귀를 막기 위해 outward path를 유지해야 한다.
2. Spring은 사용자 브라우저가 아니라 **Next trusted caller**를 상대한다.
3. 인증 source of truth가 아직 Next에 있으므로,
   내부 hop 계약을 따로 두는 편이 안전하다.

## Spring internal endpoint contract

## 1) 템플릿 목록 조회

### Endpoint
- `GET /space-templates`

### Request headers
- required:
  - `X-Yeon-User-Id`
- optional:
  - `X-Yeon-Request-Id`

### Query params
- 없음

### 의미
- 호출 주체는 Next BFF다.
- `X-Yeon-User-Id`는 Next가 인증한 현재 사용자 식별자다.
- Spring은 이 값 기준으로 **현재 Next와 동일하게 사용자 정의 템플릿 목록만** 반환한다.
- 시스템 템플릿은 1차 목록 응답에 섞지 않는다.

### Success response
- `200 OK`

```json
{
  "templates": [
    {
      "id": "tmpl_user_owned",
      "name": "나의 템플릿",
      "description": null,
      "isSystem": false,
      "tabCount": 1,
      "fieldCount": 0,
      "tabPreviewNames": ["개요"],
      "fieldPreviewNames": [],
      "createdAt": "2026-05-07T00:00:00.000Z",
      "updatedAt": "2026-05-07T00:00:00.000Z"
    }
  ]
}
```

### Error response
- `400 Bad Request`
  - header 누락/형식 오류
- `500 Internal Server Error`
  - backend query/mapping 실패

## 2) 템플릿 상세 조회

### Endpoint
- `GET /space-templates/{templateId}`

### Path params
- `templateId: string`

### Request headers
- required:
  - `X-Yeon-User-Id`
- optional:
  - `X-Yeon-Request-Id`

### Success response
- `200 OK`

```json
{
  "template": {
    "id": "tmpl_xxx",
    "name": "기본",
    "description": "필수 탭만 포함된 기본 구성입니다.",
    "isSystem": true,
    "tabCount": 5,
    "fieldCount": 0,
    "tabPreviewNames": ["개요", "출석·과제"],
    "fieldPreviewNames": [],
    "createdAt": "2026-05-07T00:00:00.000Z",
    "updatedAt": "2026-05-07T00:00:00.000Z",
    "tabsConfig": [
      {
        "name": "개요",
        "tabType": "system",
        "systemKey": "overview",
        "displayOrder": 0,
        "fields": []
      }
    ]
  }
}
```

### Error response
- `400 Bad Request`
  - `templateId` 형식 불가
  - header 누락/형식 오류
- `404 Not Found`
  - 템플릿 없음
  - 사용자 접근 권한 없음
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

### 1차 규칙
- 브라우저 public contract로 문서화하지 않는다.
- 외부 클라이언트가 직접 보내는 입력으로 신뢰하지 않는다.
- ingress/edge에서 직접 노출하는 API로 쓰지 않는다.

### 향후 변경 가능성
- auth migration 이후에는
  - JWT
  - internal service token
  - gateway propagated principal
  로 바뀔 수 있다.

## Response shape 규칙

### 원칙
- Spring response shape는 **Next outward contract와 동일 구조**를 목표로 한다.
- 이유:
  - Next route에서 변환 로직을 최소화하기 위해
  - contract diff를 줄이기 위해

### 목록 응답 shape
- `{ "templates": SpaceTemplateSummary[] }`

### 상세 응답 shape
- `{ "template": SpaceTemplateDetail }`

## Error shape 규칙

### Spring internal contract 기본 shape
```json
{
  "error": {
    "code": "SPACE_TEMPLATE_NOT_FOUND",
    "message": "템플릿을 찾지 못했습니다."
  }
}
```

### 1차 원칙
- Spring 내부에선 구조화된 error code를 허용한다.
- 단, Next outward route는 필요하면 기존 `jsonError` shape로 다시 변환한다.

## Error code 초안

### 목록 조회
- `INVALID_USER_HEADER`
- `SPACE_TEMPLATE_LIST_FAILED`
- 현재 규칙:
  - 목록에서 시스템 템플릿 미포함

### 상세 조회
- `INVALID_USER_HEADER`
- `INVALID_TEMPLATE_ID`
- `SPACE_TEMPLATE_NOT_FOUND`
- `SPACE_TEMPLATE_ACCESS_DENIED`
- `SPACE_TEMPLATE_DETAIL_FAILED`

## Next BFF translation 규칙

### 목록 route
- Next route:
  - `GET /api/v1/space-templates`
- 동작:
  1. `requireAuthenticatedUser`
  2. 현재 user id 추출
  3. Spring `GET /space-templates` 호출
  4. 응답 body 그대로 outward response로 반환
  5. Spring error를 `jsonError`로 번역

### 상세 route
- Next route:
  - `GET /api/v1/space-templates/{templateId}`
- 동작:
  1. `requireAuthenticatedUser`
  2. 현재 user id 추출
  3. Spring `GET /space-templates/{templateId}` 호출
  4. 응답 body 그대로 outward response로 반환
  5. Spring error를 `jsonError`로 번역

## 1차 비목표
- POST/PATCH/DELETE contract 정의 금지
- duplicate/apply/snapshot contract 정의 금지
- 브라우저 직접 호출용 auth scheme 정의 금지
- OpenAPI 전면 작성 금지

## 검증 목표
- backend contract test
  - header required
  - list 200
  - detail 200/404
- web BFF test
  - Next route가 header를 정확히 전달하는지
  - outward response shape가 유지되는지

## 다음 1작업 추천
- 다음엔
  **`apps/backend` 실제 `space-templates` read skeleton 파일 생성 계획 문서 1개**
  만 만들고 멈춘다.
