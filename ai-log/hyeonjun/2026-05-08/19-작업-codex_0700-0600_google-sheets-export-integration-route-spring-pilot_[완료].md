# 19차 작업 — google-sheets export integration route spring pilot

- 시작: 07:00
- 종료: 06:00
- 상태: 완료

## 목표
- `sheet-export/route.ts`에 남은 export integration CRUD/lookup DB 로직을 Spring으로 이동한다.

## 결과
- `sheet-export/route.ts` root CRUD가 Spring integration endpoint를 쓰는 상태임을 확인했다.
- `sheet-export/import/route.ts`의 direct integration lookup을 Spring integration read 호출로 치환했다.
- `sheet-export/sync/route.ts`의 direct integration lookup을 Spring integration read 호출로 치환했다.
- `sheet-export`, `sheet-export/import`, `sheet-export/sync` route test를 추가했다.
- 이제 `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/**` 하위 route에서는 direct DB lookup이 없다.

## 검증
- `rg -n "sheetIntegrations|requireSpaceInternalIdByPublicId|getDb\(" apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export` → no matches ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/sheet-export/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/sheet-export/import/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/sheet-export/sync/__tests__/route.test.ts' 'src/server/services/__tests__/google-sheets-export-service.test.ts'` ✅
- `./gradlew test --tests 'world.yeon.backend.sheet_export.integration.*'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## 남은 것
- legacy `sheet-integrations` route layer는 아직 direct DB / Google API logic가 남아 있다.
- `apps/web/src/server/services/google-sheets-service.ts`는 아직 Spring migration 대상이다.
