# 타자 레이스 재시작 문장 랜덤화 작업

## 목표

현재 브랜치에서 브랜치 전환 없이 `다시 레이스` 시 같은 race seed가 재사용되어 문장이 반복되는 경로를 제거한다.

## 원인

- 기본/원격 덱 seed 생성 자체는 `Math.random`, `ThreadLocalRandom`, `randomInt`를 사용한다.
- 하지만 바로 레이스 화면의 quickRoom은 한 번 resolve된 `seedState.seed`를 메모하고, 멀티플레이 결과의 `다시 레이스`는 `race.rejoin()`만 호출해 기존 `quickRoomKey`/raceSeed를 그대로 재사용한다.

## 작업 계획

1. 바로 레이스 부모 화면에서 restart nonce를 도입해 seed resolve effect를 다시 실행한다.
2. 멀티플레이 결과 화면의 restart가 부모 refresh 핸들러를 우선 호출하게 한다.
3. 타입체크/린트/빌드로 검증한다.

## 변경

- 바로 레이스 부모 화면에 seed refresh token을 추가해 `다시 레이스` 시 race seed를 새로 resolve한다.
- 멀티플레이 결과 화면은 quick race에서 전달된 restart 핸들러를 우선 호출하고, 타자방 화면에서는 기존 rejoin 동작을 유지한다.
- 로컬 기본 덱 seed 생성은 직전 passageId를 제외해 문장이 2개 이상이면 직전 문장을 즉시 반복하지 않는다.
- 원격 서명 seed가 직전 passageId와 같으면 한 번 더 seed 생성을 시도한다.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
