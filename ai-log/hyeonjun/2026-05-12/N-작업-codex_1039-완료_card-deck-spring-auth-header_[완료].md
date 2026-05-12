# card-deck-spring-auth-header

- 시작: 2026-05-12 KST
- 증상: 로그인 상태인데 `POST /api/v1/card-decks`가 401 반환.
- 원인: `apps/web/src/server/card-decks-spring-client.ts`의 `fetchJson`이 기본 인증 헤더를 만든 뒤 `...init`을 뒤에서 펼쳐 `init.headers`가 전체 headers를 덮어씀. POST/PATCH 요청에서 `X-Yeon-User-Id`, `X-Yeon-Internal-Token`이 유실됨.
- 계획: 공통 헤더 병합 순서를 수정하고 회귀 테스트로 POST 요청에도 BFF 인증 헤더가 남는지 확인한다.

- 조치: Spring BFF 인증 헤더 생성 규칙을 `apps/web/src/server/spring-bff-client.ts`로 승격하고, `init.headers`가 `X-Yeon-User-Id`/`X-Yeon-Internal-Token`을 덮지 못하도록 공통 병합 순서를 고정했다.
- 적용 범위: `card-decks`, `users`, `spaces`, `members`, `member-tabs`, `space-templates`, `life-os`, `import-drafts`, `home-insight-banners`, `public-check-runtime` Spring 클라이언트.
- 회귀 방지: `spring-client-header-guard.test.ts`로 `headers` 뒤에 `...init`이 오는 BFF fetch 옵션을 금지한다.
- 검증:
  - `pnpm --dir apps/web exec vitest run src/server/__tests__/spring-client-header-guard.test.ts src/server/__tests__/spring-bff-client.test.ts src/server/__tests__/card-decks-spring-client.test.ts` 통과
  - targeted eslint 통과
  - `pnpm --filter @yeon/web typecheck` 통과
  - `git diff --check` 통과
  - `pnpm --filter @yeon/web build` 통과
