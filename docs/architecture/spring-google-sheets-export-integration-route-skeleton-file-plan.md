# Spring Google Sheets Export Integration Route Skeleton File Plan

## 차수 목표
- `sheet-export/route.ts`의 direct DB CRUD/lookup 제거

## write set
- backend
  - `sheet_export/integration/*`
  - 관련 테스트
- web
  - `src/server/sheet-export-spring-client.ts`
  - `src/app/api/v1/spaces/[spaceId]/sheet-export/route.ts`
  - route test 추가
