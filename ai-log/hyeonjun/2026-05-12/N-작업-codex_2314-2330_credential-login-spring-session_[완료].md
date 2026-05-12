# Credential login Spring 세션 생성 이관 작업 로그

- 시작: 2026-05-12 23:14 KST
- 기준: `origin/main` fast-forward 후 `codex/credential-login-spring-session-20260512`
- 사용자 요청: 이전 다음 순서 진행. credential login/register/session create 중 작은 슬라이스로 로그인과 Spring 세션 생성을 먼저 진행.

## 현재 흐름

- Web login route: `apps/web/src/app/api/auth/credentials/login/route.ts`
- Mobile login route: `apps/web/src/app/api/v1/mobile/auth/credentials/login/route.ts`
- Next service: `apps/web/src/server/auth/credentials/login-service.ts`
- 직접 DB 소유:
  - `users`
  - `password_credentials`
  - `login_attempts`
  - `auth_sessions`

## 이번 슬라이스

1. Spring credential login endpoint 추가.
2. Spring에서 rate limit/account lock, password verify, last_login_at 갱신, auth_sessions 생성 수행.
3. Next web/mobile route는 body 검증, client IP 추출, Spring BFF 호출, web cookie 설정만 유지.

## 검증 예정

- backend compile/test
- web auth session/login route tests
- web typecheck/lint/build
- git diff --check

## 구현 결과

- Spring `credential_auth` 패키지 추가.
  - `/auth/credentials/login` POST에서 email/password/ipAddress를 받아 로그인 처리.
  - IP rate limit, account lock, password_credentials Argon2 검증, email verification 확인, login_attempts 기록, users.last_login_at 갱신, auth_sessions 생성 수행.
- Spring Security Argon2 검증을 위해 `bcprov-jdk18on` 의존성 명시.
- Next web/mobile credential login route는 입력 검증, client IP 추출, Spring BFF 호출, web cookie 설정만 유지.
- 기존 Next `login-service.ts` 제거.

## 검증 결과

- `(cd apps/backend && ./gradlew compileJava test --tests 'world.yeon.backend.credential_auth.service.CredentialPasswordCompatibilityTests')` 성공.
- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `git diff --check` 성공.

## 다음 작업

- credential register를 Spring으로 이동.
- email verification/resend와 password reset/set-password를 이어서 이동.
