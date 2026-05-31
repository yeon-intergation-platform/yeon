# 타자 점령전 전체 화면 HUD 개편 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 점령전 화면을 전체 화면 모던 대전 게임 HUD로 재구성한다.
- 범위: apps/web typing-service territory, packages/typing-race-engine territory scene, docs
- 지시: 두 번째 참고 이미지는 레이아웃만 반영하고 색상은 정제된 현대적 다크 게임 팔레트로 적용한다.

## 변경

- `/typing-service/territory`를 `100vw`/`100vh` 전체 화면 HUD로 전환했다.
- 상단 점수/타이머, 좌우 팀 패널, 중앙 Phaser 보드, 하단 입력/컨트롤 바를 구성했다.
- Phaser 점령전 scene을 dark navy + muted red/blue 팔레트로 조정하고 fixed 540px 캔버스 의존을 제거했다.
- 점령전 route에서는 공용 floating community chat widget이 게임 조작부를 덮지 않도록 숨겼다.
- 300 체크리스트와 기획 문서에 전체 화면 HUD 예외/검증 상태를 반영했다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/typing-race-engine lint`
- `pnpm --filter @yeon/typing-race-engine typecheck`
- `pnpm --filter @yeon/web build`
- Playwright local smoke: `http://localhost:3000/typing-service/territory`, canvas 1개, scroll 없음, 포털 문구 없음, floating chat 없음, game title 있음.
