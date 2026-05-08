# 17차 작업 — google-sheets export run spring pilot

- 시작: 06:01
- 종료: 06:25
- 상태: 완료

## 목표
- export path의 Google Sheets clear/write transport를 Spring internal API로 이동한다.

## 실제 변경
- backend
  - `sheet_export.export_run` package 추가
  - `POST /spaces/{spaceId}/sheet-export/export-run` 추가
  - export rows read + Google clear/write + sync finalize를 Spring으로 이동
- web
  - `sheet-export-spring-client.ts`에 export-run client 추가
  - `google-sheets-export-service.ts`의 export path는 이제 access token bridge + Spring call만 남음

## 검증
- `./gradlew test --tests 'world.yeon.backend.sheet_export.export_run.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/server/services/__tests__/google-sheets-export-service.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- direct 제거 rg ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## 메모
- export path에는 이제 Google access token 획득 외의 business/transport 책임이 거의 남지 않는다.
- 남은 핵심은 import read transport를 Spring으로 옮기는 것이다.
