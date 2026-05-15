# 슬라임 게임 메이플풍 화면 개선 작업 로그

## 목표

- 사용자가 제시한 레퍼런스처럼 `/slime-game`을 풀스크린 횡스크롤 RPG 화면으로 재구성한다.
- 기존 에셋 검수 카드 중심 화면을 실제 플레이 화면 중심으로 바꾼다.

## 진행

- 백로그 작성 완료.

- `/slime-game`을 풀스크린 메이플풍 숲 전투 화면으로 재구성.
- 흰 배경 에셋 근거 카드/조작 패널 제거, 좌측 HUD·우측 미니맵/퀘스트·하단 스킬바/메뉴/EXP 도크 추가.
- 스테이지 월드 크기와 초기 전투 구도, 몬스터/플레이어 스케일 조정.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `next start -p 3104` + system Chrome Playwright headless screenshot으로 `/slime-game` 풀스크린 HUD 화면 확인 (`/tmp/slime-game-maple-ui.png`).
