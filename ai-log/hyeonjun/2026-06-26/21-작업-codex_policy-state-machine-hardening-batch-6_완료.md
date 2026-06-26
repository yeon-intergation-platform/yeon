# 21차 작업 - 정책/상태머신 보강 6차

## 대상

- 타자방 에러 상태와 재시도 가능 상태 분리
- 타자방 결과 표시 가능 조건 shared 정책화
- 타자방 동일 signed passage seed 재시도/fallback 정책 구체화
- 타자방 leave/reconnect cleanup action 분리

## 변경

- `packages/race-shared/src/typing-race.ts`에 retryable connection, 결과 표시, 동일 seed 재시도, disconnect cleanup action 정책 함수를 추가.
- `typing-room-policy.test.ts`에 연결 상태, 결과 표시, seed 재시도, cleanup action 경계 테스트를 추가.
- `TypingRacePlayScreen`이 동일 seed 재시도와 retryable connection fallback을 shared 정책으로 판정하도록 변경.
- `TypingRaceMultiplayerScreen`이 결과 패널 노출 여부를 shared 정책으로 판정하도록 변경.
- race-server `TypingRaceRoom.onLeave`가 명시적 퇴장, 로비 재접속 대기, 즉시 제거, sync-only cleanup을 shared action으로 분기하도록 정리.
- 50개 태스크 장부에서 23, 24, 25, 28번 완료 증거를 갱신.

## 검증

- `pnpm --filter @yeon/race-shared test -- typing-room-policy.test.ts`
  - 4개 파일 / 29개 테스트 통과
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-shared lint`
