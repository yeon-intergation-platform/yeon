# 14 작업 - platform home live badge green

## 목표

- 플랫폼 홈 서비스 카드의 `운영 중` 뱃지를 회색이 아닌 초록색으로 보이게 한다.

## 제약

- base/PR target은 `main`이다.
- 흰 배경 구간 디자인 규칙상 새 임의 hex 색상은 추가하지 않는다.
- 변경 범위는 플랫폼 홈 뱃지 스타일로 좁힌다.

## 진행 메모

- 브랜치: `fix/home-service-status-badge-green-20260618`
- 시작 기준: `origin/main`
- 대상 파일: `apps/web/src/features/landing-home/landing-home.tsx`
- `YeonBadge` 기본 neutral 배경과 live 상태 색상이 충돌하지 않도록 상태 뱃지는 `YeonView as="span"`으로 직접 렌더링한다.

## 검증

- Playwright `http://localhost:3005/`
  - `운영 중` 뱃지 computed style 확인:
    - background `rgb(240, 253, 244)`
    - text `rgb(21, 128, 61)`
    - border `rgb(187, 247, 208)`
    - dot `rgb(22, 163, 74)`
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.
