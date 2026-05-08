# 42차 작업 — googledrive browser Spring pilot

- 시작: 16:12
- 종료: 16:20
- 상태: 완료

## 목표
- `/api/v1/integrations/googledrive/status`
- `/api/v1/integrations/googledrive/files`
- `/api/v1/integrations/googledrive/file/[fileId]`
- Next direct `googledrive-service` read/browser 의존 제거

## 변경
- backend
  - `apps/backend/src/main/java/world/yeon/backend/googledrive_browser/**`
  - `apps/backend/src/test/java/world/yeon/backend/googledrive_browser/**`
- web
  - `apps/web/src/server/googledrive-browser-spring-client.ts`
  - `apps/web/src/app/api/v1/integrations/googledrive/status/route.ts`
  - `apps/web/src/app/api/v1/integrations/googledrive/files/route.ts`
  - `apps/web/src/app/api/v1/integrations/googledrive/file/[fileId]/route.ts`
  - route tests 3개 추가
- docs
  - `docs/product/backlog/spring-googledrive-browser-pilot.md`
  - `docs/architecture/spring-googledrive-browser-*.md`

## 핵심 결과
- status/files/file-content route는 이제 auth + Spring 호출 + 응답 번역만 담당한다.
- token 조회/갱신, scope 확인, Drive files list/content download는 Spring이 담당한다.
- OAuth start/callback, analyze/import lane는 이번 차수 범위 밖으로 유지했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.googledrive_browser.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/integrations/googledrive/status/__tests__/route.test.ts' 'src/app/api/v1/integrations/googledrive/files/__tests__/route.test.ts' 'src/app/api/v1/integrations/googledrive/file/[fileId]/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- googledrive browser 3 route 기준 direct `googledrive-service` 없음
- `isConnected`, `hasGoogleSheetsAccess`, `getValidAccessToken`, `listFiles`, `downloadFile` direct 호출 없음

## 다음
- 남은 googledrive lane은 `auth`, `auth/callback`, `analyze`, `import`다.
- 다음 smallest lane은 `onedrive browser` 또는 `googledrive analyze/import orchestration` 재실측 후 고정한다.
