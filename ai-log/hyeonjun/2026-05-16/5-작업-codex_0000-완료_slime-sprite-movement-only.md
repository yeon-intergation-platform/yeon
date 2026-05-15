# 슬라임 스프라이트 좌우 이동 검증 작업 로그

## 목표

- `/slime-game`에서 실제 슬라임 sprite가 좌우 이동/방향 반전/walk 프레임으로 제대로 보이는지 하나만 검증한다.
- 배경, 몬스터, 체력, 점프, 근접/원거리 공격 등은 모두 제외한다.

## 진행

- 백로그 작성 완료.
- `/slime-game` 상태를 `idle`/`walk`, `x`, `facing`, `tick`만 갖는 단순 상태로 축소했다.
- 실제 `slime_hero_sheet.png`를 `SpriteSheet`로 렌더링하고, 프레임 0~2(idle), 3~6(walk)만 표시하도록 했다.
- 화면을 스프라이트 이동 검증 패널로 단순화하고 A/D, ←/→ 입력만 처리하도록 했다.

## 검증

- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `next start -p 3106` + system Chrome Playwright headless 확인 성공.
  - ArrowRight 입력 중 `x 96px` → `x 212px` 이동.
  - `walk`, `right`, 프레임 `#3` 표시 확인.
  - 스크린샷: `/tmp/slime-game-sprite-walk-right.png`.
