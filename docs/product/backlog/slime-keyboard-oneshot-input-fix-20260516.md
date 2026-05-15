# 슬라임 키보드 one-shot 입력 유실 수정 백로그 (2026-05-16)

## 1차

### 작업내용

- `/slime-game`에서 Space와 J 키 입력이 반응하지 않는 문제를 수정한다.
- interval tick에서도 버튼과 동일하게 input snapshot을 사용해 one-shot `pressed` 입력 유실을 막는다.
- 이동 held 입력과 점프/공격 pressed 입력의 처리 기준을 공용 snapshot 방식으로 통일한다.

### 논의 필요

- D/A 이동은 held 입력이라 기존에도 동작했지만, Space/J는 pressed 입력이라 React state updater 실행 시점에 영향을 받았다.
- 이번 수정은 입력 처리 안정화만 다루며 전투/히트박스/데미지 도메인은 추가하지 않는다.

### 선택지

- A. interval tick에서 `snapshotSlimeInputState`를 만든 뒤 원본 pressed를 지우고, snapshot으로 `nextState`를 계산한다.
- B. pressed를 여러 tick 유지한다.
- C. Space/J를 held 입력처럼 처리한다.

### 추천

- A. one-shot 입력 의미를 유지하면서 React state updater 실행 시점에 독립적이다.

### 사용자 방향

- A 기준으로 진행한다.
