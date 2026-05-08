# Spring Google Sheets Import Mutation Skeleton File Plan

## 차수 목표
- import evaluation 다음 단계인 planned member mutation apply를 Spring으로 이동한다.

## write set
- backend
  - `sheet_export/import_mutation/controller/*`
  - `sheet_export/import_mutation/dto/*`
  - `sheet_export/import_mutation/repository/*`
  - `sheet_export/import_mutation/service/*`
  - 관련 테스트
- web
  - `src/server/sheet-export-spring-client.ts`
  - `src/server/services/google-sheets-export-service.ts`

## out of scope
- Google OAuth / Sheets transport 이동
- re-export write sequence 자체를 Spring으로 이동
