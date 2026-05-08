# 15차 작업 — google-sheets import mutation spring pilot

- 시작: 05:11
- 종료: 05:30
- 상태: 완료

## 목표
- google-sheets import coordinator에 남은 planned create/update 실행을 Spring internal mutation API로 이동한다.

## 실제 변경
- backend
  - `sheet_export.import_mutation` package 추가
  - `POST /spaces/{spaceId}/sheet-export/import-mutation` 추가
  - linked export integration 검증 + member create/update + field-values upsert orchestration를 Spring으로 이동
- web
  - `sheet-export-spring-client.ts`에 import mutation client 추가
  - `google-sheets-export-service.ts`에서 direct `createMember/updateMember/bulkUpsertMemberFieldValuesInSpring` 제거
- docs
  - backlog / architecture 문서 추가

## 검증
- `./gradlew test --tests 'world.yeon.backend.sheet_export.import_mutation.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/server/services/__tests__/google-sheets-export-service.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## 메모
- update mutation에서 `status = null`은 기존 Next 동작과 동일하게 미변경으로 유지했다.
- 다음 남은 큰 lane은 Google transport/OAuth bridge와 re-export write sequence 정리다.
