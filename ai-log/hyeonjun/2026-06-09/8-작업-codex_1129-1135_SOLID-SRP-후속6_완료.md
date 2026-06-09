# SOLID/예외 원칙 후속 6차

## 목표

- 300개 백로그 중 `typing-race-room.ts` 큰 파일 SRP 항목을 실제 코드 분리로 줄인다.
- 방 상태/프로토콜/seed 책임과 Spring backend HTTP IO 책임을 분리한다.

## 범위

- `apps/race-server/src/rooms/typing-race-room.ts`
- `apps/race-server/src/rooms/typing-race-room-backend-client.ts`
- 백로그 항목 49, 관련 항목 61

## 진행

- `yeon-4`에서 `origin/main` 기반 `codex/solid-exception-followup-6` 브랜치 사용.
- `typing-race-room.ts` 내부의 Spring backend base URL, internal token header, experience award `fetch` 호출을 새 backend client 모듈로 분리했다.
- Room 파일에는 `awardTypingRaceFinished` 호출만 남겨 레이스 상태/프로토콜 책임과 외부 HTTP IO 책임을 분리했다.
- 백로그 항목 49, 61을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/race-server lint`
- `CI=true pnpm --filter @yeon/race-server typecheck`
- `CI=true pnpm --filter @yeon/race-server build`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 백로그 300개 유지 및 항목 49/61 완료, `typing-race-room.ts` 직접 `fetch` 제거 검증 스크립트

## 결과

- 타자 레이스 Room의 Spring 경험치 적립 HTTP IO가 별도 client 모듈로 분리되어 SRP/DIP 위반 후보가 줄었다.
