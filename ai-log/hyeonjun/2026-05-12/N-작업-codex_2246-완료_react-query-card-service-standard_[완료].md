# React Query card-service 표준화 1차 작업 로그

## 목표

- React Query 표준화 계획의 1차 실행으로 공식 server-state 문서를 추가한다.
- card-service 기준 구현에 남아 있는 `card-rooms` raw queryKey와 직접 fetch를 표준 패턴으로 정리한다.

## 작업 범위

- `docs/architecture/web-server-state.md`
- `docs/architecture/README.md`
- `apps/web/src/features/card-service/hooks/use-card-room.ts`
- `apps/web/src/features/card-service/hooks/index.ts`

## 완료 내용

- `web-server-state.md`에 TanStack Query 서버 상태 표준을 문서화했다.
- `cardRoomsQueryKey()`를 추가하고 `useCardRoomList`에서 raw `queryKey: ["card-rooms"]`를 제거했다.
- 카드방 목록/생성/참여 호출을 `cardServiceFetchJson` 경유로 통일했다.
- card-service public hook export에 `cardRoomsQueryKey`를 포함했다.

## 검증 결과

- `rg 'queryKey:\s*\[' apps/web/src/features/card-service apps/web/src/app/card-service` 통과: 출력 없음.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과.

## 남은 일

- 다음 차수에서 `apps/web/src` 전체 raw queryKey inventory를 서비스별로 분류한다.
