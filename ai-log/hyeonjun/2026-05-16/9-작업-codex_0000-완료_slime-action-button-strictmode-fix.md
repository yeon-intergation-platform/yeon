# 슬라임 액션 버튼 Strict Mode 입력 유실 수정 작업 로그

## 목표

- `/slime-game` dev 환경에서 점프/공격 버튼이 눌려도 action이 바뀌지 않는 문제를 수정한다.
- 공용 sprite input tool에 snapshot helper를 추가해 React Strict Mode에서도 one-shot 입력이 안정적으로 처리되게 한다.

## 원인

- 버튼 트리거가 `setState` updater 내부에서 `clearPressedControls`를 호출했다.
- React dev Strict Mode에서는 updater가 두 번 호출될 수 있어 첫 호출 뒤 pressed 입력이 지워지고, 두 번째 계산 결과가 최종 반영되면서 jump/attack이 idle로 돌아갔다.

## 진행

- `snapshotSpriteInputState`를 공용 sprite action tool에 추가했다.
- 슬라임 도메인에 `snapshotSlimeInputState` wrapper를 추가했다.
- 버튼 트리거는 입력을 snapshot으로 복사한 뒤 원본 pressed를 정리하고, state updater는 snapshot만 읽도록 바꿨다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- 현재 실행 중인 `http://localhost:3000/slime-game` dev server에서 Playwright로 검증 통과:
  - ArrowRight 이동 후 x 증가 및 `이동 (walk)`.
  - 점프 버튼 후 y 증가 및 `점프 (jump)`, `#7`.
  - 공격 버튼 후 `공격 (attack)`, `#11`.

## 결과

- 코드 변경 완료. PR(main) 머지까지 진행 예정.
