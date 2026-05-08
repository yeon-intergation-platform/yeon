# Spring Google Sheets Export Sync Pilot

## 작업내용
- `google-sheets-export-service.ts` export path에 남은 direct DB ownership(`sheet_integrations.last_synced_at`, snapshot replace)을 Spring internal API로 이동한다.
- 이번 차수는 Google Sheets transport 자체는 Next에 남기고, write 성공 후 sync finalization만 Spring이 담당한다.

## 논의 필요
- integration 존재 검증을 write 전/후 어디서 보장할지
- sync finalization request가 rows payload 전체를 다시 받을지
- lastSyncedAt과 snapshot replace를 단일 transaction으로 묶을지

## 선택지
- 선택지 A: write 성공 후 Spring sync-finalize API를 호출한다.
- 선택지 B: write 전 validation API와 write 후 finalize API를 둘로 나눈다.
- 선택지 C: Google write transport까지 Spring으로 같이 이동한다.

## 추천
- **선택지 A**
- 이유: 현재 남은 direct DB ownership 제거가 가장 작은 차수다. Google transport/OAuth는 마지막 lane으로 남겨두고, export path의 source of truth만 먼저 Spring으로 정리하는 편이 안전하다.

## 사용자 방향
- 추천 기준으로 진행
