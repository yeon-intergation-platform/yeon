# Spring Google Sheets Import Context Package Plan

## 문서 목적
- google-sheets migration 다음 차수로 import coordinator의 서버 기준 read context를 Spring internal API로 이동하는 구조를 고정한다.

## 1차 범위
- Spring internal API
  - `GET /spaces/{spaceId}/sheet-export/import-context?sheetId=...`
- Spring 담당
  - export integration lookup
  - current members read
  - field definitions read
  - current custom field values read
  - current canonical payload 조합
  - snapshot rows read
- Next 담당
  - Google access token 확보
  - sheet read transport
  - conflict 계산
  - member create/update
  - field-values write
  - re-export trigger

## Next side cutover 결과
- `google-sheets-export-service.ts`의 import path direct `members/memberFieldDefinitions` read 제거
- per-member current payload 조합 제거
- snapshot read는 새 import context 응답으로 일원화
