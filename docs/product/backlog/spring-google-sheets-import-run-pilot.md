# Spring Google Sheets Import Run Pilot

## 작업내용
- `google-sheets-export-service.ts` import path에 남은 Google Sheets read transport와 orchestration(read → evaluation → mutation → re-export)을 Spring internal API로 이동한다.
- Next는 access token bridge만 유지한다.

## 논의 필요
- blocked 응답 shape를 기존 Next 결과와 동일하게 유지할지
- applied 후 lastSyncedAt source를 export-run 결과로 통일할지
- Google read transport 실패 메시지 번역 책임을 어디에 둘지

## 선택지
- 선택지 A: Spring import-run endpoint가 전체 flow를 수행한다.
- 선택지 B: Google read만 Spring으로 옮기고 evaluation/mutation/orchestration은 분리 유지한다.
- 선택지 C: OAuth token source of truth까지 같이 이동한다.

## 추천
- **선택지 A**
- 이유: evaluation/mutation/export-run이 이미 Spring에 있으므로 import path도 한 endpoint로 감싸면 Next가 token bridge 수준으로 줄어든다.

## 사용자 방향
- 추천 기준으로 진행
