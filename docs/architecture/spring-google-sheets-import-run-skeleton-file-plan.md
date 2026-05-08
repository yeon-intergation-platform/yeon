# Spring Google Sheets Import Run Skeleton File Plan

## 차수 목표
- import path transport와 orchestration를 Spring으로 이동한다.

## write set
- backend
  - `sheet_export/import_run/*`
  - 관련 테스트
- web
  - `src/server/sheet-export-spring-client.ts`
  - `src/server/services/google-sheets-export-service.ts`

## out of scope
- OAuth/token source of truth 이동
