# Spring Google Sheets Field Values Pilot

## 작업내용
- `google-sheets-export-service.ts`에 남아 있는 `member-field-values-service` direct read/write 의존을 Spring client 기반으로 전환한다.
- 1차 범위는 linked sheet import 경로의 current field values read / bulk upsert write 두 지점을 Spring source of truth로 바꾸는 것이다.

## 논의 필요
- export coordinator 전체를 Spring으로 옮길지, field-values 의존만 먼저 치환할지
- buildSpaceExportRows의 직접 DB join read는 이번 lane에 포함할지
- `google-sheets` lane의 최종 위치를 Next coordinator vs Spring integration service 중 어디로 둘지

## 선택지
- 선택지 A: import 경로의 field-values read/write 의존만 먼저 Spring client로 치환한다.
- 선택지 B: import + export 전체를 한 번에 Spring integration service로 이전한다.
- 선택지 C: field-values뿐 아니라 members CRUD까지 같이 이전한다.

## 추천
- **선택지 A**
- 이유: 현재 active direct 의존은 `getFieldValuesForDefinitions(...)`와 `bulkUpsertFieldValues(...)` 두 지점으로 좁혀져 있으므로, 이 경계부터 제거하는 편이 가장 작은 diff로 source of truth를 Spring으로 모을 수 있다.

## 사용자 방향
- 추천 기준으로 진행
