# 타자 점령전 타자방 선입장 및 결과 UI 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 점령전은 타자방 대기 화면을 거쳐 입장하게 하고, 종료 시 레퍼런스형 결과판을 표시한다.
- 범위: apps/web typing-service, docs/product/backlog, ai-log
- 원칙: 서버 authoritative snapshot/result를 UI 원천으로 사용, 프로토콜 값은 유지하고 UI 라벨만 주황팀/보라팀으로 매핑

## 변경

- 홈의 `점령전 입장` CTA를 직접 점령전이 아니라 타자방 로비로 보낸다.
- 타자방 대기 헤더에 `점령전 입장` 버튼을 추가하고 현재 `roomId`를 쿼리로 전달한다.
- 타자방 내부 내비게이션에서 점령전 이동은 명시적 방 나가기 처리로 막지 않는다.
- `/typing-service/territory` 직접 접근 시 타자방 선입장 안내 화면을 보여준다.
- `roomId`가 있는 점령전 종료 상태에서는 레퍼런스형 승리/무승부 결과판, 주황팀/보라팀 점수 카드, 좌우 순위판, 방 나가기/대기방 버튼, 24초 뒤 대기방 복귀 안내를 표시한다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/race-server typecheck` 통과
- `pnpm --filter @yeon/race-server lint` 통과
- `pnpm --filter @yeon/race-server build` 통과
- `pnpm --filter @yeon/race-server smoke:territory -- --players=2 --delay-ms=80 --reconnect=1` 통과
- race-server sourceRoomId 필터 smoke 통과: 같은 타자방 roomId는 같은 점령전 방, 다른 타자방 roomId는 다른 점령전 방
- `pnpm --filter @yeon/web build` 통과: `/typing-service/territory` dynamic route 확인
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- `git diff --check` 통과

## 참고

- 이 워크트리는 의존성이 비어 있어 `pnpm install`로 node_modules를 복구한 뒤 검증했다.
