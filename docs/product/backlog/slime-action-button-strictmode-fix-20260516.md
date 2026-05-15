# 슬라임 액션 버튼 Strict Mode 입력 유실 수정 백로그 (2026-05-16)

## 1차

### 작업내용

- `/slime-game` dev 환경에서 점프/공격 버튼이 동작하지 않는 원인을 수정한다.
- 버튼 one-shot 입력 처리에서 React Strict Mode의 state updater 재호출에도 입력이 유실되지 않게 만든다.
- 공용 sprite input tool에 입력 snapshot helper를 추가해 mutable input ref를 안전하게 state 계산에 넘긴다.

### 논의 필요

- 키보드 held 입력은 현재 동작하지만, 버튼 입력은 클릭 직후 한 틱만 살아야 해서 snapshot 기준으로 처리한다.
- 이 수정은 sprite action 검증 입력 안정화만 다루며, 게임 전투/히트박스/데미지 도메인은 추가하지 않는다.

### 선택지

- A. 공용 `snapshotSpriteInputState`를 추가하고 버튼 트리거에서 snapshot으로 `nextState`를 계산한다.
- B. `flushSync`로 버튼 입력 state 계산을 강제한다.
- C. 버튼 클릭 시 일정 시간 pressed를 유지한다.

### 추천

- A. React 렌더링 모드에 의존하지 않고 input snapshot을 source of truth로 삼아 유지보수성이 가장 좋다.

### 사용자 방향

- A 기준으로 진행한다.
