# 43차 작업 — onedrive browser Spring pilot

- 시작: 16:25
- 종료: 16:35
- 상태: 완료

## 목표
- `/api/v1/integrations/onedrive/status`
- `/api/v1/integrations/onedrive/files`
- `/api/v1/integrations/onedrive/file/[fileId]`
- Next direct `onedrive-service` read/browser 의존 제거

## 변경
- backend
  - `apps/backend/src/main/java/world/yeon/backend/onedrive_browser/**`
  - `apps/backend/src/test/java/world/yeon/backend/onedrive_browser/**`
- web
  - `apps/web/src/server/onedrive-browser-spring-client.ts`
  - `apps/web/src/app/api/v1/integrations/onedrive/status/route.ts`
  - `apps/web/src/app/api/v1/integrations/onedrive/files/route.ts`
  - `apps/web/src/app/api/v1/integrations/onedrive/file/[fileId]/route.ts`
  - route tests 3개 추가
- docs
  - `docs/product/backlog/spring-onedrive-browser-pilot.md`
  - `docs/architecture/spring-onedrive-browser-*.md`

## 핵심 결과
- status/files/file-content route는 이제 auth + Spring 호출 + 응답 번역만 담당한다.
- token 조회/갱신, Graph files list/content download는 Spring이 담당한다.
- Personal Vault / access denied 번역도 Spring service로 이동했다.
- OAuth start/callback, analyze/import lane는 이번 차수 범위 밖으로 유지했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.onedrive_browser.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/integrations/onedrive/status/__tests__/route.test.ts' 'src/app/api/v1/integrations/onedrive/files/__tests__/route.test.ts' 'src/app/api/v1/integrations/onedrive/file/[fileId]/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- onedrive browser 3 route 기준 direct `onedrive-service` 없음
- `isConnected`, `getValidAccessToken`, `listFiles`, `downloadFile` direct 호출 없음

## 다음
- 남은 onedrive lane은 `auth`, `auth/callback`, `analyze`, `import`다.
- 다음 smallest lane은 `googledrive/onedrive analyze-import shared orchestration` 또는 `counseling-records` 재실측 후 고정한다.
