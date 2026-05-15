# 슬라임 점프·공격 스프라이트 테스트 리팩토링 작업 로그

## 목표

- `/slime-game`에서 이동뿐 아니라 점프와 공격 sprite action도 테스트할 수 있게 한다.
- 입력/프레임 재생/스프라이트 sheet 계산을 공용 툴로 분리하고, 슬라임 고유 action/frame/control 정의는 도메인 파일에 모은다.
- 게임 전투/몬스터/체력은 추가하지 않고 sprite action 검증 범위만 유지한다.

## 진행

- 백로그 작성 완료.
- `sprite-action-tool.ts`를 추가해 sprite sheet cell/viewHeight 계산, input held/pressed 처리, control code 판별, loop/clamp frame playback을 공용화했다.
- `slime-game-domain.ts`에 idle/walk/jump/attack frame mapping과 이동/점프/공격 key binding을 집중시켰다.
- `/slime-game` 상태 전이를 x 이동, y 점프, action/actionTick 중심으로 재구성했다.
- 화면은 점프/공격 테스트 버튼, 현재 액션/프레임/좌표 상태, action별 프레임 미리보기를 표시한다.
- 버튼 기반 점프/공격은 클릭 즉시 한 틱을 소화하도록 처리해 브라우저 검증에서 one-shot 입력 유실을 막았다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- Playwright headless Chrome 검증 통과:
  - 초기 상태: `대기 (idle)`, `#0`.
  - ArrowRight 이동 후 x 좌표 증가, `이동 (walk)`.
  - 점프 버튼 후 y 좌표 증가, `점프 (jump)`, `#7/#8` 범위.
  - 공격 버튼 후 `공격 (attack)`, `#10/#11/#12` 범위.
  - 스크린샷: `/tmp/slime-game-action-test.png`.

## 결과

- 코드 변경 완료. PR(main) 머지까지 진행 예정.
