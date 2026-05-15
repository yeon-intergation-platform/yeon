# 슬라임 에셋 게임 프로토타입 작업 로그

## 목표

- manifest 기준 최신 생성 에셋만 남기고 미사용 이미지를 정리한다.
- 해당 에셋으로 웹에서 확인 가능한 슬라임 게임 프로토타입을 만든다.

## 결과

- `/slime-game` route를 추가했다.
- 최신 manifest-locked 생성 시트 10개만 `apps/web/public/slime-game/assets/`에 복사했다.
- 이전 실험 이미지 `ai-log/hyeonjun/2026-05-15/generated-sprites/`와 생성 폴더 내 구버전 실험 PNG 11개를 삭제했다.
- 주인공/초록슬라임/박쥐/버섯/맵/props/포탈/effects/items-ui/background 시트 사용 근거를 화면에 노출했다.

## 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과 (`/slime-game` static route 생성 확인)
