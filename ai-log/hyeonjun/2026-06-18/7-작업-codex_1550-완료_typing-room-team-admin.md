# 타자방 점령전 팀 이동/admin 주입 작업 로그

## 목표

- 방 제목이 방 종류보다 먼저 보이게 한다.
- 점령전 대기실의 팀 이동을 실제 서버 상태 변경으로 연결한다.
- admin 페이지에서 점령전 대기실에 유효한 연습 참가자를 넣을 수 있게 한다.

## 진행

- 백로그 2차를 추가했다.
- `room.team` 이벤트를 추가하고, 점령전 참가자 snapshot에 `team`을 포함했다.
- race-server가 점령전 참가자 팀 배정, 팀 이동, admin 연습 참가자 주입을 같은 참가자 상태로 처리하게 했다.
- `/admin/typing-rooms` 페이지와 `/api/v1/admin/typing-rooms/team-participants` 프록시를 추가했다.
- 방 생성 모달과 대기실 헤더에서 방 제목이 방 종류보다 먼저 보이게 정리했다.

## 검증

- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/race-shared lint`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/race-server build`
- `node bin/verify-parity.mjs`
- `git diff --check`
- Playwright: 점령전 방 생성 후 제목이 메타보다 위에 렌더링되는지 확인했다.
- Playwright: 점령전 대기실에서 `팀 이동` 클릭 후 Guest가 파랑팀으로 이동하는지 확인했다.
- Playwright: race-server 내부 admin 주입 API로 연습 참가자 2명이 추가되고 UI에 반영되는지 확인했다.
- Playwright: 일반 방에는 `시작하기`만, 점령전 방에는 `점령전 입장`만 노출되는지 확인했다.
