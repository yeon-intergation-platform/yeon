# Spring Google Sheets Snapshot Pilot

## 작업내용
- `google-sheets-export-service.ts`에 남아 있는 snapshot read/write 책임을 Spring internal API로 이동한다.
- 이번 차수는 snapshot persistence 경계만 이동하고, import conflict 계산과 Google API transport는 Next에 남긴다.

## 논의 필요
- snapshot read/write를 같은 차수에 묶을지
- import coordinator까지 같이 옮길지
- lastSyncedAt 조회 책임을 snapshot API가 일부 함께 가질지

## 선택지
- 선택지 A: snapshot read/write만 먼저 Spring으로 이동한다.
- 선택지 B: snapshot + import conflict helper를 같이 이동한다.
- 선택지 C: snapshot보다 Google transport를 먼저 이동한다.

## 추천
- **선택지 A**
- 이유: 현재 export read lane은 이미 Spring으로 이동했고, snapshot은 import coordinator 직전의 가장 작은 다음 source of truth다. DB 직접 접근을 제거하면서도 OAuth/token 경계를 건드리지 않을 수 있다.

## 사용자 방향
- 추천 기준으로 진행
