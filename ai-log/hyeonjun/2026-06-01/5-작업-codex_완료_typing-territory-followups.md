# 타자 점령전 후속 단계 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: Phaser 연출, 재접속 복구, 2~6인/지연 smoke를 구현한다.
- 범위: packages/typing-race-engine, packages/race-shared, apps/race-server, apps/web typing-service, docs
- 원칙: 서버 authoritative, shared protocol 단일화, 플레이 영역만 게임 연출 허용

## 변경

- `packages/typing-race-engine`에 `mountTerritoryBattleEngine` Phaser scene 추가
- 웹 점령전 화면에 Phaser 보드 영역 연결, React board는 조작 fallback으로 유지
- `TerritoryBattlePlayerSnapshot`에 `isConnected`, `disconnectedAt` 추가
- race-server `TerritoryBattleRoom`에 Colyseus reconnectionToken 기반 재접속 복구 추가
- web 점령전 hook에 localStorage reconnectionToken 저장/복구 추가
- race-server 2~6인 smoke script 추가
- 점령전 기획/아키텍처/300 체크리스트 문서에 후속 구현 상태 기록

## 검증

- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-shared test`
- `pnpm --filter @yeon/typing-race-engine lint`
- `pnpm --filter @yeon/typing-race-engine typecheck`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/race-server build`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `pnpm --filter @yeon/race-server smoke:territory -- --players=2 --delay-ms=80 --reconnect=1`
- `pnpm --filter @yeon/race-server smoke:territory -- --players=6 --delay-ms=80`
- `git diff --check -- <owned paths>`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 남은 후속

- 운영 배포 뒤 `https://typing.yeon.world/territory`와 `https://race.yeon.world/health` smoke 확인
- 덱 단어 연동, Spring 결과 저장, 랭킹, 모바일 최적화, 운영 부하 측정은 별도 제품 후속
