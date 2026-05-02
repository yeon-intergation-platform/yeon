---
name: race-server-conventions
description: |
  yeon Colyseus 멀티플레이 race-server 작성 컨벤션. seed 무결성, room state, message protocol, packages/race-shared 동기화를 통일한다. 트리거: 경로가 `apps/race-server/**`이거나 `packages/race-shared/**`, `packages/typing-race-engine/**` 변경 시.
---

# race-server-conventions

## Purpose

멀티플레이는 모든 참가자가 동일 seed로 동일 결과를 도출해야 한다. 서버/클라이언트 프로토콜이 비대칭으로 흩어지면 desync, 부정행위, room state 깨짐이 발생한다.

## Use_When

- `apps/race-server/**` 경로 파일 수정·생성
- `packages/race-shared/**` 또는 `packages/typing-race-engine/**` 변경
- Colyseus `Room`, `Schema`, `MessageHandler` 신규 작성
- typing race seed/protocol/state 관련 코드
- `apps/web/src/features/typing-service/use-race-room.ts` 변경 (서버와 짝)

## Do_Not_Use_When

- `apps/web/src/features/typing-service/`의 단일 플레이어 코드 (싱글 플레이는 별도)
- `packages/typing-race-engine/`의 순수 계산 로직만 (seed 계산은 engine 안에서)
- 카드 서비스, 상담 워크스페이스 등 race 무관 도메인

## Why_This_Exists

race-server는 실시간 동기화가 핵심이며 작은 prototype drift도 desync로 이어진다. AGENTS.md에서 "race-server 변경 시 seed/protocol 무결성 반드시 확인", "멀티플레이: 모든 참가자 동일 seed 보장 필수"가 명시됐는데 절차로 정리되지 않음.

## Conventions

### 1. seed는 room 생성 시 1회 결정

- room의 모든 참가자가 동일 seed 받음
- seed로부터 quote 선택, 타이밍, 챌린지 모두 결정
- 이후 변경 금지 (참가자별 다른 결과 방지)

```ts
// 좋음
class RaceRoom extends Room<RaceState> {
  onCreate() {
    this.state.seed = generateSeed(); // 한 번만
    this.state.quote = pickQuote(this.state.seed);
  }
}

// 나쁨 — 참가자 입장마다 새 seed
onJoin(client) { this.state.seed = Math.random(); }
```

### 2. Schema는 `@yeon/race-shared`에 단일 정의

- 서버 `Room` state, 클라이언트 useRaceRoom 훅이 동일 type 참조
- Colyseus Schema 데코레이터(`@type`)는 shared 패키지에서 export
- 클라이언트 서버 양쪽이 같은 Schema class import

### 3. message protocol은 discriminated union으로 명시

```ts
// race-shared
export type RaceMessage =
  | { kind: "input"; charIndex: number; ts: number }
  | { kind: "leave" }
  | { kind: "ready" };
```

- 서버 message handler에서 `kind` 기반 분기
- 새 메시지 추가 시 양쪽 동시 업데이트

### 4. WPM/CPM/accuracy 계산은 `typing-race-engine`에서만

- 서버, 클라이언트 모두 같은 engine 함수 호출 → 동일 값 보장
- 클라이언트에서 직접 계산 금지

### 5. 시간 동기화는 server tick 기준

- `Date.now()` 클라이언트별 다름 → 서버 tick `state.elapsedMs` 사용
- 클라이언트는 표시 보정만, 비교/판정은 서버 값

### 6. 부정/지연 입력 검증

- `charIndex`는 단조 증가만 허용
- 서버 측에서 quote 길이 초과 인덱스 거부
- 비정상 입력 timestamp는 서버 tick과 비교해 reject

### 7. room 종료 시 cleanup

- `onLeave`에서 player 제거
- 참가자 0명이 되면 `onDispose`에서 timer/state 해제

### 8. Schema 변경 = 클라이언트도 강제 업데이트

- Schema field 추가/제거는 양쪽 동시 deploy 아니면 desync
- 호환성 필요하면 optional field로 추가, 일정 후 cleanup

## Anti-Patterns

❌ 클라이언트가 자체 seed로 quote 선택 → 참가자별 다른 quote
❌ Colyseus Schema를 서버에만 정의, 클라이언트는 plain TS interface 복제 → drift
❌ message kind를 string literal 직접 비교 (`if (msg.type === "input")`) — discriminated union 추론 손실
❌ `Date.now()`로 입력 timestamp 비교
❌ WPM/accuracy 클라이언트 자체 계산 → 결과 불일치
❌ Room state mutation을 비동기 콜백 안에서 (Colyseus는 동기 mutation 권장)

## Verification

- 변경 후 양쪽 동시 빌드: `pnpm --filter @yeon/race-server build` + `pnpm --filter @yeon/web typecheck`
- 두 명 이상 참가자로 로컬 테스트: 동일 quote, 동일 progress, 동일 결과
- desync 의심되면 seed 로깅으로 양쪽 비교

## References

- 룰 SSOT: `.claude/rules/typing-service.md`
- shared protocol: `packages/race-shared/`
- 엔진: `packages/typing-race-engine/`
- 클라이언트 짝: `apps/web/src/features/typing-service/use-race-room.ts`
