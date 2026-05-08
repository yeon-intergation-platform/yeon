# 16차 작업 — google-sheets export sync spring pilot

- 시작: 05:31
- 종료: 06:00
- 상태: 완료

## 목표
- export path의 integration timestamp/snapshot finalize를 Spring internal API로 이동한다.

## 실제 변경
- backend
  - `POST /spaces/{spaceId}/sheet-export/sync` 추가
  - snapshot replace + `sheet_integrations.last_synced_at` 갱신을 Spring으로 이동
- web
  - `sheet-export-spring-client.ts`에 sync finalize client 추가
  - `google-sheets-export-service.ts`에서 direct integration update/snapshot replace 제거

## 검증
- `./gradlew test --tests 'world.yeon.backend.sheet_export.snapshot.*' --tests 'world.yeon.backend.sheet_export.sync.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/server/services/__tests__/google-sheets-export-service.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- direct 제거 rg ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
