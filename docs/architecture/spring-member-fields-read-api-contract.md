# Spring Member Fields Read API Contract

## 문서 목적
- `member-fields` read 1차 파일럿의 Spring 내부 계약과 Next outward 계약을 고정한다.
- 이번 문서는 구현 전의 **API contract SSOT**다.

## 범위
### outward contract 유지
- `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`

### Spring internal contract 신설
- `GET /spaces/{spaceId}/member-tabs/{tabId}/fields`

## 1차 정책
- 응답은 `{ fields: [...] }`만 지원한다.
- `memberId` query 기반 values 결합은 **이번 contract에서 제외**한다.
- overview lazy backfill은 **이번 contract에서 제거**한다.

## Next → Spring header 규칙
필수 header:
- `X-Yeon-User-Id`
- `X-Yeon-Internal-Token`

설명:
- `X-Yeon-User-Id`: Next가 인증 완료한 내부 caller identity 전달용
- `X-Yeon-Internal-Token`: Spring internal endpoint 보호용

## Endpoint
### `GET /spaces/{spaceId}/member-tabs/{tabId}/fields`

#### path params
- `spaceId: string`
- `tabId: string`

#### query params
- 1차에서는 없음
- `memberId`는 지원하지 않음

#### request body
- 없음

## Success response
HTTP 200

```json
{
  "fields": [
    {
      "id": "mfd_123",
      "name": "상태",
      "sourceKey": null,
      "fieldType": "select",
      "options": [
        { "label": "진행중", "value": "in_progress" }
      ],
      "isRequired": false,
      "displayOrder": 0
    }
  ]
}
```

## Field item shape
- `id: string`
- `name: string`
- `sourceKey: string | null`
- `fieldType: string`
- `options: Array<{ label: string; value: string }> | null`
- `isRequired: boolean`
- `displayOrder: number`

## Error response
Top-level shape:

```json
{
  "code": "SPACE_NOT_FOUND",
  "message": "스페이스를 찾지 못했습니다."
}
```

### 1차 에러 코드 초안
- `SPACE_NOT_FOUND`
- `TAB_NOT_FOUND`
- `TAB_SPACE_MISMATCH`
- `INVALID_REQUEST`

## Next BFF translation 규칙
### Next가 계속 담당하는 것
- 세션/인증 확인
- Spring 호출
- Spring 에러 → `jsonError` 번역

### Next가 1차에서 제거할 것
- `getOverviewTab(...)`
- `createDefaultOverviewFields(...)`
- `getFieldsForTab(...)`
- `getFieldValuesForDefinitions(...)` 를 섞어 쓰는 직접 orchestration

## 1차 비목표
- values 응답 `{ fields, values }`
- overview field bootstrap
- field write/delete/reorder
- member-specific authorization 강화

## 다음 1작업 추천
- 다음엔
  **`spring-member-fields-read-skeleton-file-plan.md`**
  를 만들어 file/write set 순서를 고정한다.
