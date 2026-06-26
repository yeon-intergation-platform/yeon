# 게임 플레이 BFF 경계 테스트

## 목표

- 기능 변경 없이 `/api/v1/game-service/play` route의 운영상 중요한 실패 경계를 테스트로 고정한다.

## 근거

- 상세 화면은 게임 시작 시 `/api/v1/game-service/play`를 fire-and-forget로 호출한다.
- route는 비로그인 204, 입력 검증 400, 경험치/최근 플레이 Spring 호출 실패 swallow를 의도하고 있다.
- 기존 `apps/web/src/app/api/v1/game-service` 하위 route 테스트가 없어 회귀를 자동으로 잡기 어렵다.

## 작업 계획

- route test를 추가해 인증, 입력, 성공, Spring 실패 경계를 고정한다.
- web test/lint/typecheck와 SSOT 검증을 실행한다.

## 작업

- `/api/v1/game-service/play` route test를 추가했다.
- 비로그인 204, 인증 사용자 잘못된 JSON 400, 잘못된 slug 400, 성공 시 경험치/최근 플레이 호출, Spring 실패 시 204 유지와 한국어 오류 로그를 검증한다.

## 검증

- `pnpm --filter @yeon/web test -- src/app/api/v1/game-service/play/__tests__/route.test.ts`
  - Vitest 전체 212개 파일, 932개 테스트 통과
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
