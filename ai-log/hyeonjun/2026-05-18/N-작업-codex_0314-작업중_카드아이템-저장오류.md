# 카드 아이템 저장 오류

## 요청
- 카드 목록에서 카드 수정 후 저장하면 `Spring backend 요청에 실패했습니다.`가 뜨는 문제 수정.

## 목표
- 실제 저장 실패 원인을 확인해 수정한다.
- 사용자에게 내부 구현명이 섞인 오류가 노출되지 않게 한다.

## 확장 범위
- 카카오 로그인 provider_not_configured/리디렉션 루프까지 같은 인증 이전 회귀로 묶어 수정한다.
- 사용자가 운영 Kakao env 값은 이미 있다고 확인했으므로 compose/backend 전달과 쿠키 상태 전이를 코드로 해결한다.

## 방향 전환
- 사용자가 Cloudflare Tunnel Published application routes에 Spring backend를 먼저 추가하는 계획을 제안했다.
- 미검증 코드 수정은 중단하고, `spring-backend-public-route-auth-stability-20260518.md` 백로그에 route 계획을 별도 기록했다.
- 기존 카드 저장 401/redirect loop/Kakao env 전달 수정은 후속 차수로 보관했다.

## 구현 결과
- backend compose 환경에 `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET` 전달을 추가했다.
- 중복/오래된 `yeon.session` 쿠키가 남아도 인증 후보 전체를 검사하고, 실패 시 host-only/domain 쿠키를 함께 만료하도록 수정했다.
- 카드 서비스 401은 사용자 인증 만료 메시지로 정규화하고, 클라이언트 auth 상태를 비로그인으로 전이하도록 수정했다.
- 카드 decks Spring client의 내부 `Spring backend` 문구를 사용자 응답에서 제거했다.

## 검증
- `pnpm install --frozen-lockfile`
- `pnpm --filter @yeon/web exec vitest run src/server/auth/__tests__/request-session-token.test.ts src/server/auth/__tests__/session.test.ts src/app/api/v1/counseling-records/__tests__/_shared.test.ts src/features/card-service/card-service-fetch.test.ts src/app/api/v1/card-decks/__tests__/route.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `docker compose -f compose.prod.yml config` / `docker compose -f compose.dev.yml config` 통과(로컬 env 미주입 경고만 출력)
- `git diff --check` 통과
- `pnpm --filter @yeon/web build` 통과
