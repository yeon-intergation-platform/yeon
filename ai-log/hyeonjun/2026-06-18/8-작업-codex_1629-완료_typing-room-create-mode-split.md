# 작업 로그: 타자방 생성 모드 분리

## 목표

- 로비에서 일반 타자방 생성과 점령전 방 생성을 별도 진입으로 분리한다.
- 생성 모달 안에서 방 종류를 다시 바꾸는 흐름을 없애고, 선택한 방 종류를 source of truth처럼 보여준다.

## 범위

- `apps/web/src/features/typing-service/typing-room-lobby-screen.tsx`
- 필요 시 대기방 문구/표시 범위의 최소 수정

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- Playwright 로컬 화면 확인

## 결과

- 로비에서 `방 만들기` 단일 버튼을 제거하고 `일반 타자방 만들기` / `점령전 방 만들기`로 분리했다.
- 생성 모달에서는 선택한 방 종류를 읽기 전용으로 보여주고, `gameType` 라디오를 제거했다.
- 실제 생성 검증에서 일반 방은 `시작하기`만, 점령전 방은 `점령전 입장`만 노출되는 것을 확인했다.

## 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- `node bin/verify-parity.mjs` 통과
- Playwright 로컬 검증 통과
  - 로비/모달: `http://localhost:3004/typing-service/rooms`
  - 일반 방: `http://localhost:3004/typing-service/rooms/gFH2gVXPg`
  - 점령전 방: `http://localhost:3004/typing-service/rooms/42ucCIXcI`
  - 스크린샷: `/tmp/yeon-room-lobby-mode-split.png`, `/tmp/yeon-standard-create-modal.png`, `/tmp/yeon-territory-create-modal.png`, `/tmp/yeon-standard-waiting-room.png`, `/tmp/yeon-territory-waiting-room.png`
