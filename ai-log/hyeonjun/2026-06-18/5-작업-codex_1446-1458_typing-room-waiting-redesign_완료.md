# 타자방 대기 화면 레이아웃 정리

## 범위

- `apps/web/src/features/typing-service/typing-room-screen.tsx`
- 타자방 점령전 대기 화면의 시각 배치와 반응형 구조 정리

## 계획

- 기존 대기방 상태/준비/점령전 입장 로직은 유지한다.
- 점령전 대기 패널을 상단 요약, 좌측 정보, 중앙 팀 대기실, 하단 채팅 구조로 재정렬한다.
- 로컬에서 web/race-server를 띄워 Playwright로 실제 화면을 확인한다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 로컬 `http://localhost:3002/typing-service/rooms/AUK6Ap6ir` Playwright 확인
  - desktop: `tmp-typing-room-desktop-v2.png`
  - mobile: `tmp-typing-room-mobile.png`
