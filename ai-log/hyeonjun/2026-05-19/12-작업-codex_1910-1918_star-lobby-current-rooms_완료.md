# 스타 로비 현재 열린 방 목록 화면

- 일시: 2026-05-19 19:10~19:18
- 작업자: Codex
- 브랜치: feat/star-lobby-current-rooms

## 작업 내용

- Next BFF `GET /api/v1/star-lobby/rooms`를 추가해 Spring 현재 방 목록 API를 웹에서 호출할 수 있게 했다.
- `/star-lobby` 실시간 패널에 현재 열린 방 목록, 마지막 관측 시각, 관측 기반 안내 문구를 추가했다.
- 초기 방 목록은 Spring에서 불러오고, 이후 `room_observed`/`room_disappeared` WebSocket 이벤트는 같은 목록 캐시를 갱신하게 했다.

## 경계

- Spring이 현재 방 목록의 원천이다.
- Next는 BFF 브리지만 담당한다.
- race-server는 초기 원천이 아니라 접속 중 이벤트 갱신만 담당한다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
