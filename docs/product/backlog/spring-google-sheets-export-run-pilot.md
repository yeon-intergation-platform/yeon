# Spring Google Sheets Export Run Pilot

## 작업내용
- `google-sheets-export-service.ts` export path에 남은 Google Sheets clear/write transport를 Spring internal API로 이동한다.
- Next는 access token bridge만 유지하고, export row build + Google write + sync finalize는 Spring이 맡는다.

## 논의 필요
- Google access token을 Spring에 raw header/body로 넘겨도 되는지
- integration existence를 write 전 검증할지
- export rows build 로직을 기존 read service 응답 재조합으로 재사용할지

## 선택지
- 선택지 A: access token을 받은 Spring export-run endpoint가 전체 export를 수행한다.
- 선택지 B: clear/write만 Spring으로 옮기고 row build는 Next에 남긴다.
- 선택지 C: import read/write transport까지 한 차수에 함께 이동한다.

## 추천
- **선택지 A**
- 이유: export path는 이미 row read와 sync finalize가 Spring에 있다. transport까지 옮기면 Next export path가 access token bridge 수준으로 수축된다.

## 사용자 방향
- 추천 기준으로 진행
