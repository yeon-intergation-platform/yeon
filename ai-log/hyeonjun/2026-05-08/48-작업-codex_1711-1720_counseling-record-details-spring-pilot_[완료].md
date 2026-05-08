# 48차 작업중 — counseling-record-details Spring pilot

## 목표
- `/api/v1/counseling-records/details`를 Spring read endpoint로 전환한다.

## 현재 계획
- backend `counseling_record_details` package 추가
- Next route를 spring client로 cutover
- controller test + route test + typecheck/build 검증

## 결과
- backend `counseling_record_details` read package 추가
- Next `counseling-records/details` route를 spring client 기반 thin BFF로 전환
- bulk detail read + transcript segments + relation publicId 조합을 Spring으로 이동

## 검증
- `./gradlew test --tests 'world.yeon.backend.counseling_record_details.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/counseling-records/details/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
