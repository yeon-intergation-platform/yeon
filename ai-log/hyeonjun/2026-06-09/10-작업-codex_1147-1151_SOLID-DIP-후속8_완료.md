# SOLID/예외 원칙 후속 8차

## 목표

- 300개 백로그 중 항목 63을 실제 코드 개선으로 줄인다.
- `useTypingRoomLobby`가 race-server endpoint/HTTP 로더 조합을 직접 알지 않도록 로비 client 책임을 분리한다.

## 범위

- `apps/web/src/features/typing-service/use-typing-room-lobby.ts`
- `apps/web/src/features/typing-service/typing-room-lobby-client.ts`
- 백로그 항목 63

## 진행

- `yeon-4`를 최신 `origin/main`으로 재설정하고 `codex/solid-exception-followup-8` 브랜치 생성.
- `resolveRaceServerUrl().replace(/^ws/, "http")`와 `loadPublicWaitingTypingRooms` 조합을 새 `typing-room-lobby-client.ts`로 분리했다.
- `useTypingRoomLobby`는 query 상태, connection failure 표시 상태, refresh callback 조합만 담당하도록 줄였다.
- 백로그 항목 63을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 백로그 300개 유지 및 항목 63 완료, 훅의 race endpoint 직접 조합 제거 검증 스크립트

## 결과

- 타자방 로비 훅의 구체 race-server HTTP 조회 의존이 client 모듈 뒤로 이동해 DIP/SRP 위반 후보가 줄었다.
