# Spring Google Sheets Legacy Sync Skeleton File Plan

- backend
  - `apps/backend/src/main/java/world/yeon/backend/sheet_integrations/**`
  - list/create/sync repository, service, controller
- web
  - `apps/web/src/server/sheet-integrations-spring-client.ts`
  - `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-integrations/route.ts`
  - `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-integrations/[integrationId]/sync/route.ts`
- tests
  - backend controller/service/repository tests
  - web route tests
