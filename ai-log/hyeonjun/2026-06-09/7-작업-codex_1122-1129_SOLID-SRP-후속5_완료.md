# SOLID/예외 원칙 후속 5차

## 목표

- 300개 백로그 중 다음 P1 큰 파일 SRP 항목을 실제 코드 분리로 줄인다.
- `apps/race-server/src/rooms/card-room.ts`의 방 상태/프로토콜 책임과 백엔드 HTTP IO 책임을 분리한다.

## 범위

- `apps/race-server/src/rooms/card-room.ts`
- 신규 race-server 내부 backend client 모듈
- 백로그 항목 48, 관련 항목 60

## 진행

- `yeon-2`에서 `origin/main` 기반 `codex/solid-exception-followup-5` 브랜치 생성.
- `card-room.ts` 내부 Spring backend base URL, internal token/participant header, JSON fetch/오류 응답 처리 책임을 `card-room-backend-client.ts`로 분리했다.
- Room 클래스의 Spring 요청 진입점은 backend client 함수 호출로 축소했다.
- `card-room.ts` 직접 `fetch` 의존을 제거해 항목 48(SRP)과 60(DIP)을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/race-server lint` 통과
- `CI=true pnpm --filter @yeon/race-server typecheck` 통과
- `CI=true pnpm --filter @yeon/race-server build` 통과
- `CI=true pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- 백로그 번호 300개 유지, 항목 48/60 완료 확인
- `card-room.ts`에서 직접 `fetch`, `backendBaseUrl`, `springHeaders` 제거 확인

## 결과

- 카드방 Room 파일에서 Spring HTTP IO 책임을 분리했다.
