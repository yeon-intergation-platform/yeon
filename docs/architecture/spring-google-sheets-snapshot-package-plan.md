# Spring Google Sheets Snapshot Package Plan

## 문서 목적
- google-sheets migration 다음 차수로 snapshot read/write 경계를 Spring internal API로 옮기는 패키지 구조를 고정한다.

## 1차 범위
- Spring internal API
  - `GET /spaces/{spaceId}/sheet-export/snapshots?sheetId=...`
  - `PUT /spaces/{spaceId}/sheet-export/snapshots`
- Spring 담당
  - export integration lookup
  - snapshot row 조회
  - snapshot 전체 교체
  - base payload hash 계산
- Next 담당
  - Google access token 확보
  - sheet read/clear/write transport
  - import conflict 계산
  - integration `lastSyncedAt` update coordinator

## 추천 패키지 구조
root:
- `world.yeon.backend.sheet_export.snapshot`

하위:
- `controller`
- `service`
- `repository`
- `dto`

## Next side cutover 결과
- `google-sheets-export-service.ts`의 direct `sheetIntegrationMemberSnapshots` read/write 제거
- export 후 snapshot replace는 Spring mutation 호출로 대체
- import 전 snapshot row 조회는 Spring read 호출로 대체
