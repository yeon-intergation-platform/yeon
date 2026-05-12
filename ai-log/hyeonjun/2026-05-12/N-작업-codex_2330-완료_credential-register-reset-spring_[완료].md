# Credential register/reset Spring 이관 작업 로그

- 시작: 2026-05-12 23:30 KST
- 기준: `origin/main` 최신 main 후 `codex/credential-register-reset-spring-20260512`
- 목표: credential register, email verification/resend, password reset/set-password를 Spring으로 이동.

## 이번 슬라이스

- Spring credential_auth에 register/resend/verify/reset-request/reset-confirm/set-password endpoint 추가.
- Spring이 users/password_credentials/email_verification_tokens/password_reset_tokens/auth_sessions/login_attempts 변경을 소유.
- Next route는 입력 검증, origin/ip/session-token 전달, redirect/cookie/BFF만 유지.

## 검증 예정

- backend compile/test
- web typecheck/lint/build
- `git diff --check`

## 구현 결과

- Spring `credential_auth`에 가입, 인증메일 재발송, 이메일 인증, 비밀번호 재설정 요청/확인, 비밀번호 추가 API를 추가했다.
- Resend 메일 발송과 메일 템플릿, 이메일 발송 rate limit을 Spring으로 옮겼다.
- Next credential route handler는 Zod 입력 검증, client ip/app origin/session-token 전달, redirect/응답 매핑만 남겼다.
- Next의 credential DB service, password hash, email sender/template, auth rate-limit legacy 파일을 제거했다.

## 검증 결과

- `(cd apps/backend && ./gradlew compileJava)` 성공
- `(cd apps/backend && ./gradlew test --tests 'world.yeon.backend.credential_auth.service.CredentialPasswordCompatibilityTests')` 성공
- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `pnpm --filter @yeon/web build` 성공
- `git diff --check` 성공
- Next credential route/server에서 제거 대상 legacy service/email/rate-limit 참조 없음 확인
