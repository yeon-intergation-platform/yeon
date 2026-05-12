# 타자방 상태 화면/옵션 경계 분리

## 목표

- 프론트 전반 표준화의 타자서비스 후속 차수로 `typing-room-screen.tsx`의 연결 상태 화면과 대기방 옵션 상수를 feature 하위 파일로 분리한다.
- 실시간 room orchestration 동작은 그대로 유지한다.

## 범위

- `apps/web/src/features/typing-service/typing-room-screen.tsx`
- `apps/web/src/features/typing-service/typing-room-state-views.tsx`
- `apps/web/src/features/typing-service/typing-room-options.ts`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 진행

- 2026-05-13 07:58 작업 시작.
- 상태 화면 컴포넌트와 대기방 옵션 상수 분리 완료.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과.
- 2026-05-13 08:35 작업 완료.
