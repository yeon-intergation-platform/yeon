# sheet export routes Spring bridge cutover

## 1차

### 작업내용
- CSV/XLSX export route가 `google-sheets-export-service`를 직접 import하지 않도록 Spring 기반 export BFF helper로 전환한다.
- sheet-export sync/import route가 `google-sheets-export-service`를 직접 import하지 않도록 Spring 실행 helper로 전환한다.
- 기존 Google access token bridge는 Next BFF 책임으로 유지하고, export/import 계산 및 mutation은 Spring endpoint 호출을 source of truth로 둔다.
- 관련 route/service tests를 새 경계에 맞게 갱신한다.

### 논의 필요
- Google OAuth token 저장/갱신 자체는 아직 Next 쪽 기존 인증 브리지에 남아 있다. 이 범위는 별도 OAuth 저장소 이관 차수에서 다룬다.

### 선택지
1. route-level service import만 제거하고 Spring 실행 helper를 `server/sheet-export-bff.ts`로 분리한다.
2. Google OAuth token 저장/갱신까지 Spring으로 한 번에 옮긴다.

### 추천
- 1번. 현재 Spring sheet-export endpoint가 이미 export/import 계산과 mutation을 맡고 있으므로 route 소유권을 먼저 얇게 만든다.

### 사용자 방향
- 추천 기준으로 진행한다.
