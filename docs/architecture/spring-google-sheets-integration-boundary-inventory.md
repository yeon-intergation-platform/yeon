# Spring Google Sheets Integration Boundary Inventory

## 문서 목적
- `apps/web/src/server/services/google-sheets-export-service.ts`의 남은 책임을 Spring 분리 관점에서 고정한다.

## 현재 책임 묶음
기준 파일:
- `apps/web/src/server/services/google-sheets-export-service.ts`

### A. Google API adapter
- `extractSheetId(...)`
- `clearSheet(...)`
- `writeSheetValues(...)`
- `readSheetValues(...)`
- `formatGoogleSheetsApiError(...)`

성격:
- 외부 API transport / 에러 포맷 번역

### B. import coordinator
- `importSpaceFromLinkedSheet(...)`
- 책임:
  - integration row 조회
  - sheet 읽기
  - header 파싱
  - current member/custom field snapshot 구성
  - conflict 판단
  - member create/update
  - field-values Spring write 호출
  - re-export 트리거

성격:
- 고수준 orchestration + business rule

### C. export read builder
- `buildSpaceExportRows(...)`
- `buildSpaceExportData(...)`
- 책임:
  - members / member_field_definitions / member_field_values join
  - 표시용 row 값 생성
  - canonical payload 생성

성격:
- read source of truth + export DTO 생성

### D. snapshot persistence
- `replaceMemberSnapshots(...)`
- `hashPayload(...)`
- `diffPayloadFields(...)`
- `buildCanonicalPayload(...)`
- `buildConflict(...)`

성격:
- import/export conflict resolution state 관리

### E. export orchestrator
- `exportSpaceToSheet(...)`
- 책임:
  - access token 확보
  - integration row 조회
  - export data build
  - clear/write Google API 호출
  - integration `lastSyncedAt` 갱신
  - snapshot replace

## 이미 Spring/분리된 것
- member field values read/write source of truth는 Spring으로 이동 완료
- Next route layer direct field-values 로직 제거 완료
- google-sheets import 안의 field-values direct helper 의존 제거 완료

## 남은 큰 Next ownership
### 1. export row builder
- DB 직접 join read
- field/value source of truth 조합
- read-only라 extraction risk 낮음

### 2. import conflict engine
- snapshot/base/server/sheet 3-way diff 규칙
- 업무 정책이 가장 진함
- 처음부터 통째로 옮기면 위험 큼

### 3. Google API transport
- OAuth access token을 Next auth/session 맥락에서 받음
- Spring 이전 시 auth bridge 설계 필요

## 추천 extraction 순서
1. **export row builder(read-only)**
2. snapshot read/write helper
3. import conflict engine
4. Google API transport / full integration service

## 이유
- 1단계는 외부 API/OAuth 영향이 없고 read-only라 검증이 쉽다.
- 2~4단계로 갈수록 state, auth, side effect가 커진다.
