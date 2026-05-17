# 카드덱 auth token validation 작업 로그

## 목표

- yeon.world 카드덱 PATCH가 로그인 쿠키를 포함해도 401을 반환하는 문제를 해결한다.

## 초기 증거

- 사용자 DevTools 요청에는 `yeon.session` 쿠키가 포함되어 있다.
- 따라서 단순 쿠키 미전송 문제가 아니라 세션 토큰 검증/전달 경로 문제로 본다.

## 진행

- 작업 시작.

## 추가 원인: 로컬 소셜 로그인 provider_not_configured

- `pnpm dev:all`은 web에는 Next의 env 로딩을 맡기지만, backend 실행 env에는 OAuth provider env를 주입하지 않았다.
- Spring root auth가 `/auth/social/complete`에서 Kakao/Google 토큰 교환을 담당하므로 backend에도 `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`이 필요하다.

## 검증

- `node --check scripts/dev-all.mjs`
- `git diff --check`

## 결과

- 로컬 `pnpm dev:all` backend/web env에 root social auth provider env를 함께 주입하도록 수정했다.
