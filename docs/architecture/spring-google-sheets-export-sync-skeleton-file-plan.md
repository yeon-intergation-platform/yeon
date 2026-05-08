# Spring Google Sheets Export Sync Skeleton File Plan

## 차수 목표
- export path direct DB finalize를 Spring으로 이동한다.

## write set
- backend
  - `sheet_export/sync/controller/*`
  - `sheet_export/sync/dto/*`
  - snapshot repository/service 확장
  - 관련 테스트
- web
  - `src/server/sheet-export-spring-client.ts`
  - `src/server/services/google-sheets-export-service.ts`

## out of scope
- Google OAuth/token source of truth 이동
- Google Sheets HTTP transport 이동
