# 카드 행 보기/편집 view 분리

## 목표

- 카드서비스 표준화 후속 차수로 `card-row.tsx`의 보기/편집 JSX를 별도 view 파일로 분리한다.
- mutation/dirty/touch orchestration은 기존 파일에 유지하고, UI/동작은 변경하지 않는다.

## 범위

- `apps/web/src/features/card-service/components/card-row.tsx`
- `apps/web/src/features/card-service/components/card-row-views.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 진행

- 2026-05-13 08:08 작업 시작.
- `card-row-views.tsx` 추가, 보기/편집/삭제 액션 view 분리 완료.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과.
- 2026-05-13 08:45 작업 완료.
