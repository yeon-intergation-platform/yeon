# 49차 작업중 — counseling-record route read Spring pilot

## 목표
- `/api/v1/counseling-records/[recordId]` GET를 Spring read endpoint로 전환한다.

## 현재 계획
- backend single detail endpoint + 404 mapping 추가
- Next route GET을 spring client 기반 thin BFF로 전환
- route/controller test + typecheck/build 검증

## 결과
- backend single counseling record detail endpoint + 404 매핑 추가
- Next `[recordId]` route의 GET path를 spring client 기반 thin BFF로 전환
- PATCH/DELETE는 기존 service 경로 유지

## 검증
- `./gradlew test --tests 'world.yeon.backend.counseling_record_details.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/counseling-records/[recordId]/__tests__/route.test.ts' 'src/app/api/v1/counseling-records/details/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
