# 50차 작업중 — counseling-record audio Spring pilot

## 목표
- `/api/v1/counseling-records/[recordId]/audio`를 Spring transport endpoint로 전환한다.

## 현재 계획
- backend audio metadata + R2 read endpoint 추가
- Next audio route를 spring client 기반 proxy로 전환
- route/controller test + typecheck/build 검증

## 결과
- backend counseling record audio transport endpoint + R2 read 추가
- Next audio route를 spring client 기반 proxy로 전환
- range/206/content-range/404 의미를 Spring으로 이동

## 검증
- `./gradlew test --tests 'world.yeon.backend.counseling_record_audio.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/counseling-records/[recordId]/__tests__/audio-route.test.ts' 'src/app/api/v1/counseling-records/[recordId]/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
