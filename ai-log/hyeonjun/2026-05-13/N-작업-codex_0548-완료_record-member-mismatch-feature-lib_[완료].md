# record member mismatch feature lib 이동

## 목표

- 상담 기록-수강생 mismatch 판정 로직의 SSOT를 feature lib로 이동한다.
- app route `_lib`는 호환 re-export로 축소한다.

## 범위

- `apps/web/src/app/counseling-service/_lib/record-member-mismatch.ts`
- `apps/web/src/app/counseling-service/page.tsx`
- `apps/web/src/app/counseling-service/_components/link-member-modal.tsx`
- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/features/counseling-record-workspace/lib/record-member-mismatch.ts`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 59차 작성 완료.

## 완료

- `record-member-mismatch` 타입/판정 로직을 feature lib로 복사해 SSOT를 이동했다.
- `page.tsx`, `link-member-modal.tsx`, `center-panel.tsx`가 feature lib를 직접 참조하도록 변경했다.
- 기존 app `_lib/record-member-mismatch.ts`는 호환 re-export로 축소했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
