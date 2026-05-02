# 4차수 — 자산 letterbox + 트랙 scale snap + fps 추가 하향

- 시작: 2026-05-03 02:25
- 종료: 2026-05-03 02:28
- 주체: claude
- 상태: 완료
- 브랜치: `fix/character-letterbox-and-scale` (origin/main 기반)

## 증상 (3차수 fix 후 잔존)

- pixelArt:true와 카드 scale snap 적용에도 트랙·카드에서 아스나·린네아가 여전히 떨림.
- 다리 움직임이 너무 빠름.

## 진단

- 카멜은 모든 프레임 width 48px로 일정. 아스나는 119~147px(28px 변동). 셀(192) 내 캐릭터 가로폭 변동 자체가 시각적 흔들림 유발.
- 이전 자산은 baseline=-5로 5px 위에 떠 있었음. 트랙 위 발 위치가 미묘하게 흔들리는 효과.
- 트랙 setScale은 여전히 비정수 (카멜 0.479 / 아스나 0.221). pixelArt 모드에서 nearest-neighbor 샘플링은 적용되지만 scale 자체가 비정수면 sub-pixel 위치 잔여 떨림.
- 다리 frequency: 사람 캐릭터는 2발이라 8프레임 8fps여도 다리 한 번 들어 올림 = 0.5s = 2Hz. 카멜 4발 0.6s = 1.7Hz/발보다 시각적으로 빠르게 보임.

## 수정

- `scripts/sprites/extract-character-run.py`: 추출 시 각 프레임의 alpha bbox를 검출해 셀 가로 중심 + 셀 바닥에 정렬하는 letterbox 정규화 추가. 가로폭 변동의 시각효과 차단.
- 자산 재생성: `apps/web/public/sprites/characters/{asuna,linnea}/run.png`. 검증 결과 baseline 모두 0, cx_offset 거의 완벽 (±0.5).
- `packages/typing-race-engine/src/index.ts`: `snapLaneScale` 도입 — frameHeight를 정수 분수(1, 1/2, 1/3, ...)로 나눈 값 중 LANE_DISPLAY_HEIGHT(46)에 가장 가까운 scale을 강제. 카멜 0.5(48px), 아스나 0.2(41.6px), 린네아 0.2.
- `apps/web/src/features/typing-service/characters/index.ts`: asuna·linnea fps `8` → `4`. 사이클 2초, 다리 1Hz/발 (카멜 1.7Hz/발보다 느림).

## 검증

- [x] 자산 정렬 검증 (baseline=0, cx_offset±0.5)
- [x] `pnpm --filter @yeon/web typecheck`
- [x] `pnpm --filter @yeon/typing-race-engine typecheck`
- [ ] 사용자 브라우저 시각 확인

## 후속

- fps 4도 빠르면 3, 너무 느리면 5~6.
- 셀 폭 자체를 캐릭터 max width(147)+padding 정도로 더 줄이면 가로 흔들림 추가 완화 가능.
