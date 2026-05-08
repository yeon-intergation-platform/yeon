# 52차 작업중 — counseling-record route mutation Spring pilot

## 목표
- `/api/v1/counseling-records/[recordId]` PATCH/DELETE를 Spring mutation endpoint로 전환한다.

## 현재 계획
- backend mutation controller/service/repository 추가
- Next route를 spring client 기반 thin BFF로 전환
- route/controller test + typecheck/build 검증

## 결과
- backend counseling-record mutation endpoint 추가
- Next `[recordId]` route의 PATCH/DELETE를 spring client 기반 thin BFF로 전환
- member link ownership check + audio object cleanup를 Spring으로 이동

## 검증
- `./gradlew test --tests 'world.yeon.backend.counseling_record_mutation.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/counseling-records/[recordId]/__tests__/route.test.ts' 'src/app/api/v1/counseling-records/[recordId]/__tests__/audio-route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
