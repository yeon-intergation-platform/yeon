# Spring Google Sheets Export Read Package Plan

## 문서 목적
- `google-sheets` 통합에서 가장 작은 다음 extraction lane으로 `buildSpaceExportRows`를 Spring read service로 분리하는 구조를 고정한다.

## 1차 범위
- Spring internal read API 신설
  - `GET /spaces/{spaceId}/sheet-export/rows`
- Next는 계속:
  - Google access token 확보
  - clear/write transport
  - lastSyncedAt 업데이트 coordinator
- Spring은 담당:
  - export row build source of truth
  - field definition ordering
  - member field value formatting용 raw row composition

## 추천 패키지 구조
root:
- `world.yeon.backend.sheet_export.read`

하위:
- `controller`
- `service`
- `repository`
- `dto`

## 책임 분리
### repository
- `spaceId -> internalId`
- members read
- member field definitions read
- member field values read

### service
- row payload 조합
- canonical export row 생성
- header metadata(`fieldDefinitions`) 포함 응답 생성

### controller
- `GET /spaces/{spaceId}/sheet-export/rows`
- header:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- error shape:
  - top-level `{ code, message }`

### dto
- `SheetExportFieldDefinitionResponse`
- `SheetExportRowResponse`
- `SheetExportRowsResponse`

## Next side cutover 결과
- `buildSpaceExportRows(...)` direct DB logic 제거
- `buildSpaceExportData(...)`는 Spring 응답을 sheet values로 변환하는 얇은 formatter만 남김
- 그 다음 단계에서 snapshot replace / export coordinator를 추가 분리할 수 있음

## 금지
- 이 단계에서 Google API clear/write를 Spring으로 옮기지 않음
- 이 단계에서 import conflict engine까지 같이 옮기지 않음
