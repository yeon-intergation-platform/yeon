# 게임 참여 BFF 경계 테스트 보강

- 시작: 2026-06-26 21:19 KST
- 범위: `apps/web/src/app/api/v1/game-service/{likes,favorites,comments}` route 테스트 추가
- 목적: 기능 변경 없이 인증, 입력 검증, Spring 오류 매핑, fallback 동작의 회귀를 줄인다.

## 진행

- `play` route 테스트 패턴을 확인했다.
- 좋아요, 찜, 댓글 route와 Spring client 오류 클래스를 확인했다.
- 좋아요/찜/댓글 route의 인증, 입력 검증, Spring 업무 오류 매핑, fallback 동작 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web test -- src/app/api/v1/game-service/likes/__tests__/route.test.ts src/app/api/v1/game-service/favorites/__tests__/route.test.ts src/app/api/v1/game-service/comments/__tests__/route.test.ts`
  - 결과: web 전체 215개 파일 / 948개 테스트 통과
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
