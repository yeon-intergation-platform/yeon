# 슬라임 스프라이트 좌우 이동 검증 백로그 (2026-05-16)

## 1차

### 작업내용

- `/slime-game`에서 배경, 몬스터, 체력, 점프, 근접/원거리 공격, 포탈, 퀘스트 UI를 모두 제외한다.
- 실제 `slime_hero_sheet.png` 스프라이트 시트만 사용해 좌우 이동 입력과 프레임 재생이 제대로 보이도록 만든다.
- A/D 또는 ←/→ 키 입력 시 위치 이동, 방향 반전, walk 프레임 순환이 명확히 보이게 한다.
- idle 상태와 walk 상태만 유지한다.

### 논의 필요

- 이번 차수에서는 게임성/디자인을 전혀 다루지 않고 스프라이트 이동 판정과 프레임 검증에만 집중한다.

### 선택지

- A. `/slime-game`을 스프라이트 이동 검증 전용 화면으로 단순화한다.
- B. 기존 게임 HUD를 유지하고 내부 플레이어만 스프라이트로 바꾼다.

### 추천

- A. 현재 문제는 전체 디자인 품질 이전에 sprite 이동이 제대로 되는지 확인하는 것이므로, 모든 잡음을 제거한 검증 전용 화면이 맞다.

### 사용자 방향

- A 기준으로 진행. 다른 기능과 배경은 전부 보류한다.

## 완료 기록

- `/slime-game`을 스프라이트 이동 검증 전용 화면으로 단순화했다.
- 실제 `/slime-game/assets/slime_hero_sheet.png`만 플레이어 렌더링에 사용한다.
- A/D 또는 ←/→ 입력에 따른 `x` 이동, `facing` 전환, idle/walk 프레임 전환을 화면에서 바로 확인할 수 있다.
- 배경, 몬스터, 체력, 점프, 근접/원거리 공격, 포탈, 퀘스트 UI는 이번 차수에서 제외했다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `next start -p 3106` + system Chrome Playwright headless screenshot: ArrowRight 입력 중 `x 96px` → `x 212px`, `walk` 상태 표시 확인
