# Spring Google Sheets Import Mutation Pilot

## 작업내용
- `google-sheets-export-service.ts` import coordinator에 남은 planned create/update 실행을 Spring internal write API로 이동한다.
- 이번 차수는 Google sheet read/write transport와 re-export trigger는 Next에 남기고, Spring은 member create/update + field-values upsert orchestration만 담당한다.

## 논의 필요
- mutation request가 `sheetId`를 포함해 linked export integration 존재를 검증할지
- update에서 빈 `status`를 기존처럼 "미변경"으로 볼지 명시적으로 null로 덮을지
- create/update/field-values를 단일 transaction으로 묶을지

## 선택지
- 선택지 A: import evaluation 결과의 planned mutations를 그대로 Spring write API에 넘긴다.
- 선택지 B: Next가 create/update payload를 다시 재조합해 더 얇은 request로 넘긴다.
- 선택지 C: mutation orchestration과 re-export까지 한 차수에 합친다.

## 추천
- **선택지 A**
- 이유: evaluation response가 이미 source of truth에 가장 가까운 canonical payload를 담고 있다. 같은 shape를 write API 입력으로 재사용하면 Next의 분기와 재조합 책임을 더 줄일 수 있다.

## 사용자 방향
- 추천 기준으로 진행
