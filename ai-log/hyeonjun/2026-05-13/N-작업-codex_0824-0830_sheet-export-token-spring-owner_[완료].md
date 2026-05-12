# Google Sheet export/import 토큰 조회 Spring 소유 전환

## 목표

- Next `sheet-export-bff`가 web DB 기반 `googledrive-service`를 호출하지 않게 한다.
- Spring sheet export/import 실행 서비스가 사용자 ID로 Google 토큰을 조회/갱신한다.

## 검증 예정

- backend sheet export/import 관련 테스트
- web typecheck 및 sheet-export route 테스트
- web build
- `git diff --check`

## 완료

- Spring sheet export/import run이 `GoogleDriveBrowserService.getValidAccessToken(userId)`로 토큰을 조회/갱신한다.
- Next `sheet-export-bff`에서 web DB 기반 `googledrive-service` 의존성을 제거했다.

## 검증

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.sheet_export.export_run.*' --tests 'world.yeon.backend.sheet_export.import_run.*'`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/sheet-export/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/sheet-export/import/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/sheet-export/sync/__tests__/route.test.ts'`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
