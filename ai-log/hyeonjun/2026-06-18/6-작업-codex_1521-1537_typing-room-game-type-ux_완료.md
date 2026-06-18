# 작업 로그: 타자방 방 종류 고정 UX

## 목표

- `점령전 입장`과 `시작하기`가 한 대기방에 동시에 보이는 문제를 제거한다.
- 방 생성 시 일반/점령전 방 종류를 선택하고, 대기방 액션은 그 종류에 맞게만 노출한다.

## 범위

- `packages/race-shared` 타자방 계약
- `apps/race-server` 타자방 생성/스냅샷
- `apps/web` 타자방 로비/대기방 UI

## 검증 예정

- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/web typecheck`
- 로컬 `http://localhost:3002` Playwright 확인

## 결과

- 방 생성 모달에 `일반 타자방`/`점령전 방` 선택을 추가했다.
- race-server 스냅샷에 방 종류를 포함하고, 점령전 방에서 일반 레이스 시작 메시지를 서버가 거부하게 했다.
- 일반 방 대기화면에는 `시작하기`만, 점령전 방 대기화면에는 `점령전 입장`만 노출되도록 분리했다.

## 검증

- `pnpm --filter @yeon/race-shared typecheck` 통과
- `pnpm --filter @yeon/race-server typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/race-shared lint` 통과
- `pnpm --filter @yeon/race-server lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `node bin/verify-parity.mjs` 통과
- Playwright 로컬 검증 통과
  - 일반 방: `http://localhost:3002/typing-service/rooms/6rVZC8CHi`
  - 점령전 방: `http://localhost:3002/typing-service/rooms/QuPW2SEXU`
  - 스크린샷: `/tmp/yeon-standard-room-mode.png`, `/tmp/yeon-territory-room-mode.png`
