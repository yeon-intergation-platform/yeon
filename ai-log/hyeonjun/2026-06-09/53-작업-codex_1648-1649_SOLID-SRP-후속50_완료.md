# SOLID SRP 후속 50 — race-server 점령전 Room 책임 분리

## 목표

- 백로그 205번: `territory-battle-room.ts` 큰 파일에서 payload 파싱, player 생성/스냅샷, team/snapshot 집계 책임을 분리한다.
- Colyseus Room 클래스는 lifecycle, 라운드 흐름, 단어 제출 처리, broadcast 책임만 유지한다.

## 진행

- 작업 워크트리 `yeon-4`를 `origin/main` 기준 `codex/solid-exception-followup-50`으로 초기화했다.
- `race-server-conventions`/`typing-service` 관련 규칙을 확인했다.

## 변경

- `territory-battle-message.ts`를 추가해 submit word payload 파싱을 분리했다.
- `territory-battle-players.ts`를 추가해 player 생성과 player snapshot 변환을 분리했다.
- `territory-battle-snapshot.ts`를 추가해 team score/captured count 집계와 room snapshot 생성을 분리했다.
- `TerritoryBattleRoom`은 lifecycle/onMessage와 라운드/submit 흐름 조립만 담당하게 축소했다.
- 백로그 205번을 완료 처리했다.

## 검증

- 진행률 스크립트: 300개 중 188개 완료, 다음 연속 후속 항목 206번.
- 라인 수: `territory-battle-room.ts` 305라인, `territory-battle-message.ts` 18라인, `territory-battle-players.ts` 58라인, `territory-battle-snapshot.ts` 61라인.
- `CI=true pnpm --filter @yeon/race-server lint`
- `CI=true pnpm --filter @yeon/race-server typecheck`
- `git diff --check`
