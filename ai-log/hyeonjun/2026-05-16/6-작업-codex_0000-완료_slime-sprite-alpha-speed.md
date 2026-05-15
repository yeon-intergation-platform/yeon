# 슬라임 스프라이트 투명 배경·속도 보정 작업 로그

## 목표

- idle은 0번 프레임 하나로 고정한다.
- 좌우 이동 속도를 올린다.
- 슬라임 sprite 요소에서 흰/체커 배경이 보이지 않도록 `slime_hero_sheet.png` 배경을 투명하게 정리한다.

## 진행

- 백로그 작성 완료.
- `slimeFrame`의 idle 분기를 0번 프레임 고정으로 변경했다.
- 이동 속도를 `5.5`에서 `8.5`로 올렸다.
- `slime_hero_sheet.png`를 RGBA PNG로 변환하고 각 셀 edge-connected 배경 픽셀 74.6%를 alpha 0으로 제거했다.
- 프레임 미리보기는 idle `#0`과 walk `#3~#6`만 보이게 줄였다.

## 검증

- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `next start -p 3107` + system Chrome Playwright headless 확인 성공.
  - idle 프레임 `#0` 확인.
  - ArrowRight 입력 중 `x 96px` → `x 283px` 이동 확인.
  - `walk`, `right`, 프레임 `#3` 표시 확인.
  - 흰 sprite 박스 제거 확인.
  - 스크린샷: `/tmp/slime-game-alpha-speed.png`.
