# 93. SOLID OCP 후속 88

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 287
- `apps/mobile/src/features/card-service/social-login.ts`

## 변경

- WebBrowser 인증 세션 성공 URL 추출을 `getSuccessfulAuthSessionUrl`로 분리했다.

## 검증

- 완료: `pnpm --filter @yeon/mobile lint`
- 완료: `pnpm --filter @yeon/mobile typecheck`
- 완료: `pnpm verify:parity`
- 완료: `git diff --check`
