# 슬라임 스프라이트 투명 배경·속도 보정 백로그 (2026-05-16)

## 1차

### 작업내용

- `/slime-game` idle 프레임을 0번 하나로 고정한다.
- 좌우 이동 속도를 현재 검증 화면보다 더 빠르게 조정한다.
- `slime_hero_sheet.png`의 흰/체커 배경이 화면에 보이지 않도록 sprite 배경을 투명하게 만든다.
- 기존 목표처럼 배경, 몬스터, 체력, 점프, 근접/원거리 공격은 계속 제외한다.

### 논의 필요

- 원본 에셋에 체커/가이드 배경이 baked-in 되어 있어 CSS만으로는 진짜 투명 요소가 되지 않는다.
- 이번 차수에서는 PNG 자체를 투명 배경으로 정리하고, 게임 기능 추가는 하지 않는다.

### 선택지

- A. `slime_hero_sheet.png` 자체를 투명 배경 PNG로 정리하고 현재 경로를 유지한다.
- B. 새 `slime_hero_sheet_transparent.png`를 만들고 코드 경로를 바꾼다.

### 추천

- A. 현재 검증 화면이 쓰는 source of truth 경로를 그대로 유지해야 이후 작업에서 흰 박스가 다시 섞일 가능성이 낮다.

### 사용자 방향

- A 기준으로 진행. idle 0번 고정, 이동속도 상향, 슬라임 sprite 배경 투명화만 처리한다.

## 완료 기록

- idle 프레임을 0번 하나로 고정했다.
- 이동 속도를 `5.5`에서 `8.5`로 올렸다.
- `slime_hero_sheet.png`를 RGB PNG에서 RGBA PNG로 변환하고, 각 셀의 edge-connected 흰/회색 체커 배경을 alpha 0으로 제거했다.
- 프레임 확인 영역은 `#0`, `#3`, `#4`, `#5`, `#6`만 노출한다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `next start -p 3107` + system Chrome Playwright headless screenshot: idle `#0`, ArrowRight 입력 중 `x 96px` → `x 283px`, `walk/right/#3`, 흰 sprite 박스 제거 확인
