# 18차 작업 — google-sheets import run spring pilot

- 시작: 06:26
- 종료: 06:55
- 상태: 완료

## 목표
- import path의 Google read transport와 orchestration를 Spring internal API로 이동한다.

## 실제 변경
- backend
  - `sheet_export.import_run` package 추가
  - `POST /spaces/{spaceId}/sheet-export/import-run` 추가
  - Google sheet read → evaluation → mutation → re-export orchestration를 Spring으로 이동
- web
  - `sheet-export-spring-client.ts`에 import-run client 추가
  - `google-sheets-export-service.ts` import path는 access token bridge + Spring call만 남음

## 검증
- `./gradlew test --tests 'world.yeon.backend.sheet_export.import_run.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/server/services/__tests__/google-sheets-export-service.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- thin BFF 확인 rg ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## 메모
- 이제 `google-sheets-export-service.ts`의 import/export path는 모두 token bridge + Spring call 수준이다.
