# Next 백엔드 역할 Spring 전체 이관 작업 로그

- 시작: 2026-05-12 22:40 KST
- 기준: `origin/main` fast-forward 후 `codex/next-backend-spring-auth-session-20260512`
- 사용자 요청: 현재 origin/main 기준 Next.js가 백엔드 역할하고 있는 것 전부를 Spring으로 이관. 인증 포함.

## 현재 인벤토리

- `apps/web/src/app/api`: route handler 140개.
- `apps/web/src/app/api/v1`: route handler 122개.
- `chat-service/auth`: 현재 origin/main에서 Spring 호출 + Next 쿠키 브리지로 이미 전환됨.
- 남은 주요 Next 백엔드 소유권:
  - 루트 인증: `apps/web/src/app/api/auth/**`, `apps/web/src/app/api/v1/auth/session`, `apps/web/src/app/api/v1/mobile/auth/credentials/login`, `apps/web/src/server/auth/**`.
  - counseling records: 생성, transcribe retry/schedule, analyze, chat, segment update.
  - Google Sheets/export BFF.
  - typing deck defaults/race seed helpers.

## 이번 슬라이스

1. 백로그 문서 작성: `docs/product/backlog/next-backend-role-full-spring-migration-20260512.md`.
2. 첫 구현: root auth session 조회/삭제를 Spring endpoint로 이동.
3. Next는 토큰 추출, 쿠키 삭제, Spring BFF 호출만 유지.

## 검증 예정

- `./gradlew -p apps/backend compileJava` 또는 실제 backend Gradle wrapper 위치 확인 후 compile.
- `pnpm --filter @yeon/web typecheck`.
- `pnpm --filter @yeon/web build`.
- `git diff --check`.

## 구현 결과

- Spring `root_auth` 패키지 추가.
  - `/auth/session` GET: session token hash 조회, 만료 세션 삭제, user/identity 조회, `last_accessed_at` 갱신.
  - `/auth/session` DELETE: token hash 기준 세션 삭제.
- Next `api/v1/auth/session`, `api/auth/logout`, `api/auth/session/cleanup`은 Spring BFF 호출 + 쿠키 정리만 수행하도록 전환.
- `apps/web/src/server/auth-session-spring-client.ts` 추가.

## 검증 결과

- `./gradlew compileJava` 성공.
- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web test src/app/api/v1/auth/session/__tests__/route.test.ts` 성공: 7 tests passed.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `git diff --check` 성공.

## 다음 작업

- credential login/register/session create를 Spring으로 이동.
- 이후 verification/reset/social OAuth를 provider별로 이동.
