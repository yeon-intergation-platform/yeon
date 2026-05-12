# 카드방 참여자/학습 panel view 분리

## 목표

- 카드서비스 표준화 후속 차수로 `card-room-screen.tsx`의 참여자 panel과 카드 진행 panel JSX를 별도 feature view 파일로 분리한다.
- 카드방 입장/실시간 연결/채팅/카드 결과 전송 동작은 유지한다.

## 범위

- `apps/web/src/features/card-service/card-room-screen.tsx`
- `apps/web/src/features/card-service/card-room-participants-panel.tsx`
- `apps/web/src/features/card-service/card-room-study-panel.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 진행

- 2026-05-13 08:20 작업 시작.
- `card-room-participants-panel.tsx`, `card-room-study-panel.tsx` 분리 완료.
- `card-room-screen.tsx` 148줄로 축소.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과.
- 2026-05-13 09:05 작업 완료.
