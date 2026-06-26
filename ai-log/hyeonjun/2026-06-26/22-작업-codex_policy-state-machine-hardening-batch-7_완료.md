# 22차 작업 - 정책/상태머신 보강 7차

## 대상

- territory battle phase 전이 가능 조건
- territory battle 결과 확정 전 노출 방지 정책

## 변경

- `packages/race-shared/src/territory-battle.ts`에 start/finish/submit/result publish phase 정책 함수를 추가.
- `territory-battle.test.ts`에 waiting 시작, playing 종료, submit phase 오류, result publish 경계 테스트를 추가.
- `apps/race-server/src/rooms/territory-battle-room.ts`가 phase 전이, submit phase 오류, result publish 조건을 shared 정책으로 판정하도록 변경.
- 50개 태스크 장부에서 29, 30번 완료 증거를 갱신.

## 검증

- `pnpm --filter @yeon/race-shared test -- territory-battle.test.ts`
  - 4개 파일 / 32개 테스트 통과
- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-shared lint`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
