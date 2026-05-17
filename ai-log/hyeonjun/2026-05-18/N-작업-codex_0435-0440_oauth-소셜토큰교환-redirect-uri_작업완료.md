# OAuth 소셜 토큰 교환 redirect_uri 정합성 작업 로그

## 목표

Google/Kakao 소셜 로그인에서 공급자 authorization 단계와 Spring token exchange 단계가 동일한 callback origin을 사용하도록 수정한다.

## 운영 확인

- `https://yeon.world/api/auth/google` → 307, redirect_uri=`https://yeon.world/api/auth/google/callback`
- `https://yeon.world/api/auth/kakao` → 307, redirect_uri=`https://yeon.world/api/auth/kakao/callback`

## 진행

- 작업 브랜치: `fix/oauth-social-callback-origin`
- 백로그 작성 완료.

## 수정

- OAuth 완료 단계의 Spring 토큰 교환 `appOrigin`을 요청 origin 대신 `NEXT_PUBLIC_APP_URL` 기반 canonical origin으로 고정했다.
- authorization URL redirect_uri와 token exchange callback origin이 같은 helper를 공유하도록 했다.
- 내부 origin(`http://yeon-prod-web:3000`) callback 요청에서도 Spring에는 `https://yeon.world`가 전달되는 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/server/auth/__tests__/handlers.test.ts src/server/auth/__tests__/social-providers.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
