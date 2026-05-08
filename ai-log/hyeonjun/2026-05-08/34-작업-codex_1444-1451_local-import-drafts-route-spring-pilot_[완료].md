# 34차 작업 — local import drafts route spring pilot

- 시작: 14:44
- 종료: 14:51
- 상태: 완료

## 목표
- local import drafts list/detail/file route를 Spring으로 이동한다.

## 작업내용
- backend `import_drafts` package를 추가했다.
- Next `api/v1/integrations/local/drafts/**` route를 Spring thin BFF로 전환했다.
- analyze/import orchestration은 일단 Next에 유지했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.import_drafts.*'' ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/integrations/local/drafts/__tests__/route.test.ts' 'src/app/api/v1/integrations/local/drafts/[draftId]/__tests__/route.test.ts' 'src/app/api/v1/integrations/local/drafts/[draftId]/file/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/integrations/local/drafts/**` 기준 `import-drafts-service` / `listImportDraftSnapshots` / `getImportDraftSnapshot` / `saveImportDraftPreview` / `deleteImportDraft` / `getImportDraftFile` no matches ✅
- `import-drafts-service.ts`는 analyze/shared consumer 때문에 아직 유지 ❗
