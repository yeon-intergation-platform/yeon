# 슬라임 키보드 one-shot 입력 유실 수정 작업 로그

## 목표

- `/slime-game`에서 Space와 J 키 입력이 반응하지 않는 문제를 수정한다.

## 원인

- interval tick에서 `setState((prev) => nextState(prev, inputRef.current))`를 예약한 직후 `clearPressedControls(inputRef.current)`를 호출했다.
- React state updater가 실제 실행될 때는 `pressed`가 이미 비워져 Space/J one-shot 입력이 사라졌다.
- D/A 이동은 `held` 입력이라 이 문제를 피해서 동작했다.

## 진행

- interval tick에서도 버튼 트리거와 동일하게 `snapshotSlimeInputState`를 먼저 만들고 원본 pressed를 정리하도록 변경했다.
- state updater는 mutable ref가 아니라 snapshot만 읽게 했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `http://localhost:3000/slime-game`에서 Playwright로 실제 키보드 입력 검증 통과:
  - `KeyD`: x 증가, `이동 (walk)`.
  - `Space`: y 증가, `점프 (jump)`, `#7`.
  - `KeyJ`: `공격 (attack)`, `#11`.

## 결과

- 코드 변경 완료. PR(main) 머지까지 진행 예정.
