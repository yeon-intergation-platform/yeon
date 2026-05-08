# 51차 작업중 — counseling-record trend-source Spring pilot

## 목표
- `/api/v1/counseling-records/analyze-trend`의 record aggregation을 Spring endpoint로 전환한다.

## 현재 계획
- backend trend source endpoint 추가
- Next route를 spring client + 기존 SSE stream으로 유지
- route/controller test + typecheck/build 검증

## 결과
- backend counseling-record trend source endpoint 추가
- Next analyze-trend route를 spring client + 기존 SSE stream 구조로 전환
- 최대 5개 제한 / 같은 수강생 검사 / segment shape를 Spring으로 이동

## 검증
- `./gradlew test --tests 'world.yeon.backend.counseling_record_details.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/counseling-records/analyze-trend/__tests__/route.test.ts' 'src/app/api/v1/counseling-records/[recordId]/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
