# Spring Google Sheets Import Evaluation Package Plan

## 문서 목적
- google-sheets import conflict engine을 Spring internal API로 이동하는 구조를 고정한다.

## 1차 범위
- Spring internal API
  - `POST /spaces/{spaceId}/sheet-export/import-evaluation`
- Spring 담당
  - sheet rows header 파싱
  - canonical payload 생성
  - duplicate/unknown/deleted/both-sides-changed 판단
  - planned creates/updates 계산
  - blocked/applied summary 계산
- Next 담당
  - Google access token 확보
  - sheet read transport
  - create/update 실행
  - field-values write
  - re-export trigger

## Next side cutover 결과
- `google-sheets-export-service.ts`의 `buildCanonicalPayload/diffPayloadFields/buildConflict` 제거
- import loop와 conflict evaluation 제거
- Next는 Spring evaluation 결과를 받아 mutation 실행만 담당
