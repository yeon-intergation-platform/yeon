# 타자 점령전 작업 로그

- 시작: 2026-06-01
- 상태: 구현/검증 완료, PR/main 배포 진행 전
- 목표: 이미지 기반 실시간 팀 타자 점령전 기획/기술 계획/300 체크리스트를 고정하고 MVP 기반을 구현한다.
- 범위: docs, packages/race-shared, apps/race-server, apps/web typing-service
- 원칙: 서버 authoritative, shared protocol 단일화, React MVP 후 Phaser 전환, 게임 중 DB write 금지

## 변경

- `docs/projects/typing-race/territory-battle.md`: 기획/기술 계획 작성
- `docs/projects/typing-race/territory-battle-checklist-300.md`: 300개 체크리스트 작성
- `docs/product/backlog/typing-territory-battle-20260601.md`: 차수형 백로그 작성
- `docs/projects/typing-race/architecture.md`: 점령전 프로토콜/문서 링크 추가
- `packages/race-shared/src/territory-battle.ts`: room/event/type/seed board/score/capture/winner helper 추가
- `packages/race-shared/src/territory-battle.test.ts`: seed/score/capture/line/team/winner 단위 테스트 추가
- `apps/race-server/src/rooms/territory-battle-room.ts`: Colyseus authoritative room 추가
- `apps/race-server/src/index.ts`: room define 및 health rooms 추가
- `apps/web/src/app/typing-service/territory/page.tsx`: 점령전 route 추가
- `apps/web/src/features/typing-service/typing-territory-battle-screen.tsx`: 점령전 화면 추가
- `apps/web/src/features/typing-service/use-territory-battle-room.ts`: Colyseus 연결 hook 추가
- `apps/web/src/features/typing-service/typing-service-home.tsx`: 점령전 CTA 추가

## 검증

- `pnpm --filter @yeon/race-shared lint` 통과
- `pnpm --filter @yeon/race-shared typecheck` 통과
- `pnpm --filter @yeon/race-shared test` 통과: 2 files, 13 tests
- `pnpm --filter @yeon/race-server typecheck` 통과
- `pnpm --filter @yeon/race-server lint` 통과
- `pnpm --filter @yeon/race-server build` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과, `/typing-service/territory` route 생성 확인
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- 로컬 WebSocket smoke 통과: `typing_territory_battle` join/start/submit/capture 성공

## 남은 운영 확인

- PR merge 후 Actions 배포 URL 확인
- 운영 `https://typing.yeon.world/territory` 200 확인
- 운영 race-server health room 목록 확인
