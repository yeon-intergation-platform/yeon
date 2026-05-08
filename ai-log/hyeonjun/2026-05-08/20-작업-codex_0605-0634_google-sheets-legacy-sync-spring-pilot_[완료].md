# 20차 작업 — google-sheets legacy sync spring pilot

- 시작: 06:05
- 종료: 06:34
- 상태: 완료

## 목표
- `sheet-integrations` route와 `google-sheets-service.ts`에 남아 있는 legacy Google Sheets activity sync 백엔드 로직을 Spring으로 이동한다.

## 진행
- Spring legacy sheet-integrations list/create/sync endpoint skeleton을 추가했다.
- Next sheet-integrations route를 Spring thin proxy로 전환했다.
- 기존 `google-sheets-service.ts`를 삭제해 Next legacy backend logic를 제거했다.

## 결과
- legacy `sheet-integrations` route/service를 Spring으로 이동했다.
- `google-sheets-service.ts`를 제거했다.
