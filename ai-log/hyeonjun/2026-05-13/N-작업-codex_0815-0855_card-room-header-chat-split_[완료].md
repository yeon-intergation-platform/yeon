# 카드방 header/chat view 분리

## 목표

- 카드서비스 표준화 후속 차수로 `card-room-screen.tsx`의 header/chat view와 label 상수를 분리한다.
- realtime 연결/입장/카드 진행 동작은 유지한다.

## 범위

- `apps/web/src/features/card-service/card-room-screen.tsx`
- `apps/web/src/features/card-service/card-room-labels.ts`
- `apps/web/src/features/card-service/card-room-header.tsx`
- `apps/web/src/features/card-service/card-room-chat-panel.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 진행

- 2026-05-13 08:15 작업 시작.
- `card-room-labels.ts`, `card-room-header.tsx`, `card-room-chat-panel.tsx` 분리 완료.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과.
- 2026-05-13 08:55 작업 완료.
