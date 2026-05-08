# 33차 작업 — life-os spring pilot

- 시작: 14:28
- 종료: 14:43
- 상태: 완료

## 목표
- life-os days/read/write/report route와 service를 Spring으로 이동한다.

## 작업내용
- backend `life_os` package를 추가했다.
- Next `api/v1/life-os/**` route를 Spring thin BFF로 전환했다.
- route cutover 뒤 production consumer가 사라진 `life-os-service.ts`를 제거했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.life_os.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/life-os/days/__tests__/route.test.ts' 'src/app/api/v1/life-os/days/[date]/__tests__/route.test.ts' 'src/app/api/v1/life-os/reports/daily/__tests__/route.test.ts' 'src/app/api/v1/life-os/reports/weekly/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/life-os/**` 기준 `life-os-service` / `listLifeOsDays` / `getLifeOsDay` / `upsertLifeOsDay` / `buildLifeOsDailyReport` / `buildLifeOsWeeklyReport` no matches ✅
- `apps/web/src/server/services/life-os-service.ts` 삭제 완료 ✅
