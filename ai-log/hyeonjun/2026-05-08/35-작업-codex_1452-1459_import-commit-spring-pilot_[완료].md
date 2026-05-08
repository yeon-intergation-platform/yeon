# 35차 작업 — import commit spring pilot

- 시작: 14:52
- 종료: 14:59
- 상태: 완료

## 목표
- local / googledrive / onedrive import commit 공통 경로의 Next direct orchestration을 제거하고 Spring으로 이관한다.

## 작업내용
- Spring `import_commit` 패키지를 추가했다.
  - controller / dto / service / repository / tests
- import preview commit, draft status 전이, 생성 건수 계산을 Spring이 담당하게 했다.
- `apps/web/src/server/import-commit-spring-client.ts`를 추가했다.
- `apps/web/src/app/api/v1/integrations/_shared.ts`의 commit path를 Spring client 호출로 전환했다.
- local / googledrive / onedrive import route는 기존처럼 shared helper를 사용하지만, commit orchestration은 이제 Spring에서 수행한다.

## 핵심 변경
- 제거된 direct commit path 의존
  - `importPreviewIntoSpaces(...)`
  - `markImportDraftImporting(...)`
  - `markImportDraftImported(...)`
- 추가된 Spring 호출
  - `runImportCommitInSpring(...)`
- 에러 번역은 `ImportCommitSpringBackendHttpError` 기반으로 유지했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.import_commit.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/integrations/__tests__/_shared.test.ts' 'src/app/api/v1/integrations/local/__tests__/import-route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/integrations/_shared.ts` 기준 commit path에서
  - `importPreviewIntoSpaces(`
  - `markImportDraftImporting(`
  - `markImportDraftImported(`
  - no matches ✅
- 남은 것은 analyze flow 중심이다.

## 남은 것
- `executeAnalyzeRoute(...)` 및 draft analyze lifecycle은 아직 Next에 남아 있다.
- repo-wide Next backend full migration 목표는 계속 진행해야 한다.
