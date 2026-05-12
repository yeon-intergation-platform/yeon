# cloud analyze Spring 분석 bridge 전환

## 목표

- `apps/web/src/app/api/v1/integrations/_shared.ts`의 import draft 저장/AI file analysis/SSE stream 직접 호출을 제거한다.
- Cloud analyze는 provider 파일 다운로드 후 Spring local analyze multipart endpoint로 전달하는 BFF만 수행한다.

## 완료 내용

- `handleCloudAnalyzeRoute`의 Next import draft 저장/분석/SSE 직접 호출을 제거했다.
- Cloud analyze는 provider 파일 다운로드 후 Spring local analyze multipart endpoint로 전달한다.
- `ServiceError` 외 `@/server/services/*` 직접 import가 `integrations/_shared.ts`에서 사라졌다.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/integrations/__tests__/_shared.test.ts`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
  - worktree `.git` file 구조 때문에 프로젝트 검사는 skip되었고 전역 SSOT OK 출력.
