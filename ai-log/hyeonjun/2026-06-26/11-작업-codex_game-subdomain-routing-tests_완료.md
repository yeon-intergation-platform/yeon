# 게임 subdomain routing 커버리지 테스트

- 목표: `game.yeon.world` rewrite/redirect 라우팅 회귀를 막는다.
- 범위: `apps/web/src/lib/__tests__/subdomain-routing.test.ts`, backlog/log 문서.
- 변경:
  - `game.yeon.world` 루트가 `/game-service`로 rewrite되는 경계를 테스트로 고정.
  - `game.yeon.world/snake-io`가 `/game-service/snake-io`로 rewrite되는 경계를 테스트로 고정.
  - `yeon.world/game-service/snake-io`와 `game.yeon.world/game-service/snake-io`가 canonical 게임 subdomain URL로 redirect되는 경계를 테스트로 고정.
- 검증:
  - `pnpm --filter @yeon/web test -- src/lib/__tests__/subdomain-routing.test.ts`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `bash bin/verify-ssot.sh --project-only`
  - `git diff --check`
- 상태: 완료.
