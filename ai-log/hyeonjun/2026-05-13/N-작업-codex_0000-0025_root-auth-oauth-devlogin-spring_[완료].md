# Root auth OAuth/dev-login Spring 이관 작업 로그

- 시작: 2026-05-13 00:00 KST
- 기준: `origin/main` 최신 후 `codex/root-auth-oauth-spring-20260513`
- 목표: credential 외 남은 root 인증 DB/세션 역할을 Spring으로 이동.

## 이번 슬라이스

- Google/Kakao OAuth callback의 provider exchange/profile fetch/user upsert/session create를 Spring으로 이동.
- dev-login user list/create/resolve/session create를 Spring으로 이동.
- Next session/admin helper의 DB 접근 제거 및 Spring client 호출로 대체.

## 검증 예정

- backend compile/test
- web typecheck/lint/build
- `git diff --check`

## 구현 결과

- Spring `root_auth`에 OAuth 완료, dev-login 옵션/세션, 사용자 세션 생성, 관리자 판정 API를 추가했다.
- Google/Kakao token exchange/profile fetch와 social identity upsert를 Spring 서비스로 이동했다.
- Next `api/auth/*`는 state/cookie/redirect와 Spring BFF 호출만 담당하도록 축소했다.
- Next DB 기반 `auth-service`, `auth-user`와 관련 DB 단위 테스트를 제거하고 Spring 브리지 테스트로 갱신했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `(cd apps/backend && ./gradlew compileJava)` 통과
- `pnpm --filter @yeon/web exec vitest run src/server/auth/__tests__/session.test.ts src/server/auth/__tests__/admin.test.ts src/server/auth/__tests__/social-providers.test.ts src/app/api/auth/dev-login/__tests__/route.test.ts` 통과 (4 files, 18 tests)
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check && bash bin/verify-ssot.sh --project-only` 통과

## 참고

- `pnpm --filter @yeon/web test -- <paths>`는 pnpm 인자 전달 방식 때문에 의도한 path 필터 대신 전체 web suite가 실행되어 기존 unrelated 테스트 실패가 함께 출력됐다. 이후 `pnpm --filter @yeon/web exec vitest run <paths>`로 관련 테스트만 재검증했다.
