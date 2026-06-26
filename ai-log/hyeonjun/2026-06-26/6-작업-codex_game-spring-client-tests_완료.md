# 게임 Spring client 경계 테스트 보강

- 시작: 2026-06-26 21:26 KST
- 범위: `apps/web/src/server/game-*spring-client.ts` 테스트 추가
- 목적: 기능 변경 없이 Spring BFF 호출 URL/헤더/본문/오류 경계를 고정한다.

## 진행

- 게임 Spring client 4개 중 전용 테스트가 없음을 확인했다.
- route 테스트와 별개로 Spring client 호출 계약을 보강하기로 했다.
- 경험치/좋아요/라이브러리 Spring client의 URL, 헤더, 본문, 오류 처리 테스트를 추가했다.
- 1차 typecheck에서 Vitest matcher 제네릭 사용이 실패해 `satisfies Partial<...>` 표현으로 보정했다.

## 검증

- `pnpm --filter @yeon/web test -- src/server/__tests__/game-experience-spring-client.test.ts src/server/__tests__/game-likes-spring-client.test.ts src/server/__tests__/game-library-spring-client.test.ts`
  - 결과: web 전체 221개 파일 / 969개 테스트 통과
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
