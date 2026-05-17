# 카드 덱 item PATCH 401 복구

## 증상

- 운영 `PATCH https://yeon.world/api/v1/card-decks/{deckId}/items/{itemId}` 요청이 로그인 상태에서도 401 Unauthorized.
- 쿠키가 없는 동일 요청은 Next BFF에서 `{"message":"로그인이 필요합니다."}`를 반환하는 것을 확인했다.

## 원인 판단

- Spring write 권한 문제가 아니라 Next BFF가 요청에서 루트 인증 세션 쿠키를 못 보는 경로다.
- 운영 canonical/apex와 www 사이의 host-only 인증 쿠키 단절 가능성을 줄이고, 카드 서비스 fetch 계층에서 `credentials: include`가 호출자 옵션으로 덮이지 않도록 고정한다.

## 변경

- 운영 `yeon.world`/`www.yeon.world` 배포에서 루트 인증 쿠키에 `Domain=.yeon.world`를 붙여 apex/www가 같은 세션을 보게 했다.
- `cardServiceFetchJson`/`cardServiceFetchVoid`가 항상 `credentials: include`를 최종값으로 쓰게 했다.
- 회귀 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/card-service/card-service-fetch.test.ts src/server/auth/__tests__/session.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `pnpm --filter @yeon/web build`
