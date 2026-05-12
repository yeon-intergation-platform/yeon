# local analyze Spring cutover

## 목표

- `api/v1/integrations/local/analyze` route에서 Next DB/분석 서비스 직접 호출을 제거하고 Spring BFF로 전환한다.

## 시작 상태

- 작업공간: `../yeon-next-backend-role-local-analyze`
- 기준: `origin/main` (`b79c429`)
- 기존 root 작업트리에 다른 변경이 있어 별도 worktree에서 진행.

## 진행

- 백로그 문서 작성 완료.

## 완료 내용

- Spring `POST /integrations/local/analyze` 추가.
- Spring에서 로컬 import draft 생성/복구, 분석 진행 상태 저장, preview/error 저장 수행.
- CSV/TXT/XLSX/PDF/Image 분석 경로를 Spring service로 이동.
- Next route는 인증 후 multipart/SSE를 Spring으로 전달하는 BFF로 축소.

## 검증

- `cd apps/backend && ./gradlew test --tests '*LocalImportAnalysis*'` 통과.
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/integrations/local/__tests__/analyze-route.test.ts` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과(프로젝트 검사 skip 경고, 전역 OK).

## 남은 것

- api/v1 잔여 backend-role import는 counseling-records 9개 import 라인이다.
